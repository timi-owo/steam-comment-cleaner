/*
# Name: Steam Comment Cleaner (2020-11-08)
# Author: T!Mi (https://github.com/timi-owo)
*/

'use strict';
{
	const STR =
	{
		CN:
		{
			BUTTON_OK:				'好的',
			BUTTON_YES:				'确定',
			BUTTON_NO:				'取消',

			TITLE_DONE:				'运行完毕',
			TITLE_ERROR:			'发生错误',
			TITLE_CONFIRM:			'操作确认',

			ERROR_INIT_FAILURE:		'⛔ 无法读取 \"{?}\"',
			ERROR_WRONG_PAGE:		'❌ 请在 STEAM 资料页使用此代码。',
			ERROR_NOT_LOGIN:		'❌ 请先在网页上登录你的 STEAM 账号。',
			ERROR_NOT_OWNER:		'❌ 请在自己的 STEAM 资料页使用此代码。',

			CONFIRM_MESSAGE:		'⚡ 你确定要删除资料页上的全部 {?} 条留言吗？<br><br>⚠️ 警告：此操作不可逆，留言删除后无法恢复！',

			PROGRESS_COUNTING:		'♻️ 正在统计留言列表，请稍后 ···',
			PROGRESS_DELETING:		'♻️ 正在删除 {?}/{?} 条留言，请稍后 ···<br><br>💤 可能需等待较长时间，请不要刷新页面！',

			DONE_COMMENT_EMPTY:		'✔️ 你的资料页很干净，无需采取操作。',
			DONE_FULLY_DELETED:		'✔️ 已成功删除 {?} 条留言。',
			DONE_SOMEONE_MISSED:	'✔️ 已成功删除 {?}/{?} 条留言。<br><br>⚠️ 部分留言在删除时发生了错误，可以稍后再试。',

			ERROR_MESSAGE:			'请前往 https://github.com/timi-owo/steam-comment-cleaner<br><br>根据页面下方的说明提交反馈，以便尽快得到修复！'
		},

		EN:
		{
			BUTTON_OK:				'OK',
			BUTTON_YES:				'YES',
			BUTTON_NO:				'NO',

			TITLE_DONE:				'DONE',
			TITLE_ERROR:			'ERROR',
			TITLE_CONFIRM:			'CONFIRM',

			ERROR_INIT_FAILURE:		'⛔ Can not read \"{?}\"',
			ERROR_WRONG_PAGE:		'❌ Using this code on your profile page.',
			ERROR_NOT_LOGIN:		'❌ You should login into steam before we can start.',
			ERROR_NOT_OWNER:		'❌ You are not owner of this profile.',

			CONFIRM_MESSAGE:		'⚡ Are you sure want to delete all of {?} comments on your profile?<br><br>⚠️ This operation is irreversible, the comments can not be restored after deletion!',

			PROGRESS_COUNTING:		'♻️ Counting comments on your profile, please wait ···',
			PROGRESS_DELETING:		'♻️ Deleting {?}/{?} of comments, please wait ···<br><br>💤 It may takes a long time, please do not refresh the page!',

			DONE_COMMENT_EMPTY:		'✔️ Your profile is pretty clean, no further action needed.',
			DONE_FULLY_DELETED:		'✔️ {?} comments has been successfully deleted.',
			DONE_SOMEONE_MISSED:	'✔️ {?}/{?} comments has been successfully deleted.<br><br>⚠️ There was an error when deleting some comments, you can try again later.',

			ERROR_MESSAGE:			'Please visit https://github.com/timi-owo/steam-comment-cleaner<br><br>Submit according to feedback notes in order to be fixed as soon as possible!'
		}
	};

	function $(str, ...args)
	{
		let buffer = (navigator.language.includes('zh') ? STR['CN'][str] : STR['EN'][str]);
		for (let arg of args) { buffer = buffer.replace('{?}', arg); }
		return buffer;
	}

	//----------------------------------------------------------------------------------------------------

	function dismissAllDialog()
	{
		while (CModal.GetActiveModal() != null)
		{ CModal.DismissActiveModal(); }
	}

	function showAlert(title, content)
	{
		dismissAllDialog();
		return ShowAlertDialog(title, content, $('BUTTON_OK'));
	}

	function showConfirm(title, content)
	{
		dismissAllDialog();
		return ShowConfirmDialog(title, content, $('BUTTON_YES'), $('BUTTON_NO'));
	}

	function showProgress(content)
	{
		dismissAllDialog();
		return ShowDialog(null, content, { bExplicitDismissalOnly: true });
	}

	function updateProgress(dialog, content)
	{
		dialog.GetContent().find('.newmodal_content').html(content);
	}

	//----------------------------------------------------------------------------------------------------

	function checkPage()
	{
		let steamsite = document.location.host.includes('steampowered.com');
		let community = document.location.host.includes('steamcommunity.com');
		if (!steamsite && !community) { return false; }

		if (document.body.querySelector('.profile_page') == null)
		{
			showAlert($('TITLE_ERROR'), $('ERROR_WRONG_PAGE'));
			return false;
		}
		else if (typeof g_steamID == 'boolean' && !g_steamID)
		{
			showAlert($('TITLE_ERROR'), $('ERROR_NOT_LOGIN'));
			return false;
		}
		else if (typeof g_steamID != 'string')
		{
			showAlert($('TITLE_ERROR'), $('ERROR_INIT_FAILURE', 'SteamID')).done(() => {
				showAlert($('TITLE_ERROR'), $('ERROR_MESSAGE'));
			});
			return false;
		}
		else if (typeof g_sessionID != 'string')
		{
			showAlert($('TITLE_ERROR'), $('ERROR_INIT_FAILURE', 'SessionID')).done(() => {
				showAlert($('TITLE_ERROR'), $('ERROR_MESSAGE'));
			});
			return false;
		}
		else if (typeof g_rgProfileData != 'object')
		{
			showAlert($('TITLE_ERROR'), $('ERROR_INIT_FAILURE', 'ProfileData')).done(() => {
				showAlert($('TITLE_ERROR'), $('ERROR_MESSAGE'));
			});
			return false;
		}
		else if (typeof g_rgCommentThreads != 'object')
		{
			showAlert($('TITLE_ERROR'), $('ERROR_INIT_FAILURE', 'CommentThreads')).done(() => {
				showAlert($('TITLE_ERROR'), $('ERROR_MESSAGE'));
			});
			return false;
		}
		else if (g_rgProfileData.steamid != g_steamID)
		{
			showAlert($('TITLE_ERROR'), $('ERROR_NOT_OWNER'));
			return false;
		}
		else { return true }
	}

	function loadComment(steamid)
	{
		return new Promise((success, failure) =>
		{
			let xhr = new XMLHttpRequest();
			xhr.onload = () =>
			{
				if (xhr.readyState != 4) { return; }

				if (xhr.status != 200)
				{
					failure(`HTTP ${xhr.statusText} (${xhr.status})`);
					return;
				}
				else if (xhr.response == null)
				{
					failure('INVALID_RESPONSE');
					return;
				}
				else if (!xhr.response.success)
				{
					failure('STEAM_NOT_SUCCESS');
					return;
				}

				let comment = [];
				let matched = null;
				let pattern = new RegExp('(?<=comment_)[0-9]+', 'g');

				while ((matched = pattern.exec(xhr.response.comments_html)) != null)
				{ comment.push(matched[0]); }

				success(comment);
			};

			xhr.ontimeout = () => { failure('REQUEST_TIMEOUT'); };
			xhr.onerror = () => { failure('NETWORK_ERROR'); };

			xhr.open('GET', `https://steamcommunity.com/comment/Profile/render/${steamid}/-1/?start=0&count=0`, true);

			xhr.responseType = 'json';
			xhr.timeout = 15000;
			xhr.send();
		});
	}

	function deleteComment(steamid, sessionid, comment)
	{
		return new Promise((success, failure) =>
		{
			let xhr = new XMLHttpRequest();
			xhr.onload = () =>
			{
				if (xhr.readyState != 4) { return; }

				if (xhr.status != 200)
				{
					failure(`HTTP ${xhr.statusText} (${xhr.status})`);
					return;
				}
				else if (xhr.response == null)
				{
					failure('INVALID_RESPONSE');
					return;
				}

				xhr.response.success ? success() : failure('STEAM_NOT_SUCCESS');
			};

			xhr.ontimeout = () => { failure('REQUEST_TIMEOUT'); };
			xhr.onerror = () => { failure('NETWORK_ERROR'); };

			xhr.open('POST', `https://steamcommunity.com/comment/Profile/delete/${steamid}/-1/`, true);
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			let param = `gidcomment=${comment}&sessionid=${sessionid}`;

			xhr.responseType = 'json';
			xhr.timeout = 15000;
			xhr.send(param);
		});
	}

	function reloadComment()
	{
		let CommentThread = g_rgCommentThreads['Profile_' + g_steamID];
		if (CommentThread != undefined)
		{
			CommentThread.m_cMaxPages = 1;
			CommentThread.m_iCurrentPage = 1;
			CommentThread.GoToPage(0);
		}
	}

	//----------------------------------------------------------------------------------------------------

	if (checkPage())
	{
		showProgress($('PROGRESS_COUNTING'));

		loadComment(g_steamID).then((comments) =>
		{
			let total = comments.length, deleted = 0;

			if (total == 0)
			{
				showAlert($('TITLE_DONE'), $('DONE_COMMENT_EMPTY'));
				return;
			}

			showConfirm($('TITLE_CONFIRM'), $('CONFIRM_MESSAGE', total)).done(() =>
			{
				let dialog = showProgress($('PROGRESS_DELETING', deleted, total));

				function warp(steamid, sessionid, comment)
				{
					return new Promise((done, never) =>
					{
						deleteComment(steamid, sessionid, comment).then(() =>
						{
							deleted ++;
							updateProgress(dialog, $('PROGRESS_DELETING', deleted, total));
							done();

						}, (reason) =>
						{
							console.error('deleteComment :: ' + reason);
							done();
						});
					});
				}

				let tasks = [];
				for (let comment of comments)
				{ tasks.push(warp(g_steamID, g_sessionID, comment)); }

				Promise.all(tasks).then(() =>
				{
					reloadComment();

					if (deleted == total)
					{ showAlert($('TITLE_DONE'), $('DONE_FULLY_DELETED', deleted)); }
					else
					{ showAlert($('TITLE_DONE'), $('DONE_SOMEONE_MISSED', deleted, total)); }
				});
			});

		}, (reason) =>
		{
			console.error('loadComment :: ' + reason);
			showAlert($('TITLE_ERROR'), $('ERROR_MESSAGE'));

		}).catch((error) =>
		{
			console.warn('!!! Unknown Exception !!!');
			console.error(error.stack != undefined ? error.stack : error);
			showAlert($('TITLE_ERROR'), $('ERROR_MESSAGE'));
		});
	}
}

//...