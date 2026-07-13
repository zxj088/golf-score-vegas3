(() => {
  const LANGUAGE_KEY = 'vegasGolfLanguage.v1';
  const zh = {
    'Vegas Golf Scorecard': '拉斯维加斯高尔夫记分卡',
    'Las Vegas Rule': '拉斯维加斯规则',
    'Golf Scorecard': '高尔夫记分卡',
    'Share': '分享',
    'Share app': '分享应用',
    'Switch to Chinese': '切换到中文',
    'Switch to English': '切换到英文',
    'English/中文': '中文/English',
    'Team A': 'A队',
    'Team B': 'B队',
    'Player 1': '球员1',
    'Player 2': '球员2',
    'Player 3': '球员3',
    'Player 4': '球员4',
    'Player': '球员',
    'Handicap': '差点',
    'Par': '标准杆',
    'Index': '难度',
    'Difficulty': '难度',
    'Total': '合计',
    'Home': '主页',
    'Play': '记分',
    'Courses': '球场',
    'Views': '页面',
    'Local only': '仅保存在本机',
    'Edit': '编辑',
    'Edit Info': '修改信息',
    'Modify': '修改',
    'Finish': '结束',
    'Course': '球场',
    'Mode': '模式',
    'Scoring Mode': '计分模式',
    'Gross': '实际杆',
    'Net': '净杆',
    'Under Par Flip': '低于标准杆翻转',
    'Birdie flip': '低于标准杆翻转',
    'Add Course': '添加球场',
    'Search Course': '搜索球场',
    'New Game': '新比赛',
    'Playing': '进行中',
    'History': '历史记录',
    'New Course': '新球场',
    'Edit Course': '修改球场',
    'Course name': '球场名称',
    'Course name or city': '球场名称或城市',
    'Country': '国家',
    'Region': '地区',
    'All countries': '所有国家',
    'All regions': '所有地区',
    'Edit code': '编辑密码',
    'Default mode': '默认模式',
    'Tee time': '开球时间',
    'Holes 1-9': '第1-9洞',
    'Holes 10-18': '第10-18洞',
    'Out': '前九洞',
    'In': '后九洞',
    'Course total': '球场总标准杆',
    'Difficulty values cannot repeat.': '难度不能重复。',
    'Save Course': '保存球场',
    'Save Changes': '保存修改',
    'Search': '搜索',
    'Add': '添加',
    'Cancel': '取消',
    'Course Search': '球场搜索',
    'Game Setup': '比赛设置',
    'Start Game': '开始比赛',
    'Eagle': '老鹰',
    'Birdie': '小鸟',
    'Bogey': '柏忌',
    'Action': '操作',
    'Confirm': '确认',
    'Code': '密码',
    'OK': '确定',
    'Close': '关闭',
    'Yes': '是',
    'No': '否',
    'Notice': '提示',
    'Edit Code': '编辑密码',
    'Cloud sync Not ok': '云同步失败',
    'Cloud sync ok': '云同步成功',
    'Syncing...': '正在同步...',
    'Delete': '删除',
    'Custom': '自定义',
    'Preset': '预设',
    'Match totals': '比赛总分',
    'Hole scores': '各洞成绩',
    'Course par and index': '球场标准杆和难度',
    'Close add course': '关闭添加球场窗口',
    'Close new game': '关闭新比赛窗口',
    'Close score entry': '关闭成绩输入',
    'Score entry': '输入成绩',
    'Decrease score': '减少杆数',
    'Increase score': '增加杆数',
    'Quick score choices': '快速选择成绩',
    'Supabase is not connected.': 'Supabase 未连接。',
    'Add your Supabase URL and anon key to supabase-config.js.': '请在 supabase-config.js 中添加 Supabase URL 和匿名密钥。',
    'Sending and loading scorecard data.': '正在发送并加载记分卡数据。',
    'Supabase is not configured.': 'Supabase 尚未配置。',
    'Saving scorecard changes.': '正在保存记分卡更改。',
    'Edit lock acquired.': '已取得编辑权限。',
    'Another phone is now editing this game.': '另一部手机正在编辑此比赛。',
    'Edit lock refreshed.': '编辑权限已刷新。',
    "what's the code?": '请输入密码',
    'Enter the 2 digit edit code for this game.': '请输入此比赛的两位数编辑密码。',
    'The edit code is not correct. Try again.': '编辑密码不正确，请重试。',
    'Edit game': '编辑比赛',
    'Enter code, then choose Yes to edit this game.': '输入密码，然后选择“是”以编辑此比赛。',
    'Finish game': '结束比赛',
    'Enter code, then choose Yes to finish this game.': '输入密码，然后选择“是”以结束此比赛。',
    'Delete game': '删除比赛',
    'Enter code, then choose Yes to delete this finished game.': '输入密码，然后选择“是”以删除此已结束的比赛。',
    'Delete course': '删除球场',
    'Enter the course edit code, then choose Yes to delete this course.': '输入球场编辑密码，然后选择“是”以删除此球场。',
    'Enter the course edit code, then choose Yes to edit this course.': '输入球场编辑密码，然后选择“是”以修改此球场。',
    'Deleting game from cloud.': '正在从云端删除比赛。',
    'Delete failed': '删除失败',
    'Could not delete this game from the cloud. Try again.': '无法从云端删除此比赛，请重试。',
    'Deleted from cloud.': '已从云端删除。',
    'No games currently playing': '当前没有进行中的比赛',
    'No finished games': '暂无已结束的比赛',
    'Link copied': '链接已复制',
    'The app link was copied to the clipboard.': '应用链接已复制到剪贴板。',
    'Enter a valid value.': '请输入有效值。',
    'Enter a course name.': '请输入球场名称。',
    'Enter a 2 digit code.': '请输入两位数密码。',
    'Enter a par from 1 to 7.': '请输入1到7之间的标准杆数。',
    'Enter a par from 1 to 10.': '请选择1到10之间的PAR。',
    'Enter unique index values from 1 to 18.': '请输入1到18且不重复的难度值。',
    'Change course': '更换球场',
    'Changing course will recalculate Par, Index and scores. Continue?': '更换球场会重新计算标准杆、难度和比分，是否继续？',
    'Search the course API, then add one to your courses.': '搜索球场 API，然后添加到常用球场。',
    'Add your GolfCourseAPI key to supabase-config.js before searching.': '请先在 supabase-config.js 中添加 GolfCourseAPI 密钥。',
    'Searching courses...': '正在搜索球场...',
    'Choose a course to add.': '请选择要添加的球场。',
    'No results matched the selected country or region. Showing all matches.': '没有匹配所选国家或地区的结果，已显示全部匹配结果。',
    'No courses found.': '没有找到球场。',
    'Course search failed. Try again.': '球场搜索失败，请重试。',
    'Loading course scorecard...': '正在读取球场记分卡...',
    'Could not read PAR and INDEX from this course.': '无法从此球场读取 PAR 和难度。',
    'Close course search': '关闭球场搜索窗口',
    'Par {value}': '标准杆 {value}',
    'Hole {hole}': '第{hole}洞',
    'Hole {hole} - Par {par}': '第{hole}洞 - 标准杆{par}',
    'Hole {hole} {player} score': '第{hole}洞 {player} 成绩',
    'Par {par} - {type}': '标准杆 {par} - {type}',
    'Team A ({a1}+{a2}) vs. Team B ({b1}+{b2})': 'A队（{a1}+{a2}）对 B队（{b1}+{b2}）',
    'Total score: A {a}, B {b}': '总分：A {a}，B {b}'
  };

  let language = localStorage.getItem(LANGUAGE_KEY) === 'zh-CN' ? 'zh-CN' : 'en';

  function t(text, values = {}) {
    let result = language === 'zh-CN' ? (zh[text] || text) : text;
    Object.entries(values).forEach(([key, value]) => {
      result = result.replaceAll(`{${key}}`, String(value));
    });
    return result;
  }

  function applyStatic() {
    document.documentElement.lang = language;
    document.title = t('Vegas Golf Scorecard');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const value = node.nodeValue;
      const trimmed = value.trim();
      if (!trimmed || !(trimmed in zh)) return;
      node.nodeValue = value.replace(trimmed, t(trimmed));
    });
    document.querySelectorAll('[aria-label], [title]').forEach(element => {
      ['aria-label', 'title'].forEach(attribute => {
        const value = element.getAttribute(attribute);
        if (value && value in zh) element.setAttribute(attribute, t(value));
      });
    });
    const button = document.querySelector('#languageButton');
    if (button) {
      const target = language === 'en' ? t('Switch to Chinese') : t('Switch to English');
      button.textContent = language === 'en' ? 'English/中文' : '中文/English';
      button.setAttribute('aria-label', target);
      button.title = target;
    }
  }

  function toggle() {
    localStorage.setItem(LANGUAGE_KEY, language === 'en' ? 'zh-CN' : 'en');
    window.location.reload();
  }

  window.VEGAS_I18N = { applyStatic, get language() { return language; }, t, toggle };
  applyStatic();
})();
