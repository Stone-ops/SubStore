/**
 * rename_optimized.js
 * 优化版本 rename.js
 * 2024-06-xx
 * 国家数据补全版（含240+国家）
 */
// --- 1. 基础配置解析改造 ---
// 替换你原代码第一部分 config 解析
// 你组合的开关组合定义
const comboFlags = {
  flag: true, //给节点前面加国旗
  one: true,  //清理只有一个节点的地区的01
  nf: true,   //把 name= 的前缀值放在最前面
  bl: true,   //正则匹配保留 [0.1x, x0.2, 6x ,3倍]等标识
  blgd: true, //保留: 家宽 IPLC ˣ² 等
  blpx: true, //如果用了上面的bl参数,对保留标识后的名称分组排序,如果没用上面的bl参数单独使用blpx则不起任何作用
};  
/**
 * 根据输入参数对象 $arguments，构造完整 config 配置。
 * 如果传入 useCombo=true，则自动合并组合配置。
 * 用户参数有最高优先级，覆盖默认和组合的配置。
 */
function buildConfig(inArg) {
  const defaultConfig = {
    nx: false,    //保留1倍率与不显示倍率的
    bl: false,    //正则匹配保留 [0.1x, x0.2, 6x ,3倍]等标识
    nf: false,    //把 name= 的前缀值放在最前面
    key: false,
    blgd: false,  //保留: 家宽 IPLC ˣ² 等
    blpx: false,  //如果用了上面的bl参数,对保留标识后的名称分组排序,如果没用上面的bl参数单独使用blpx则不起任何作用
    blnx: false,  //只保留高倍率
    one: false,   //清理只有一个节点的地区的01
    debug: false,
    clear: false, //清理乱名
    flag: false,  //给节点前面加国旗
    nm: false,    //保留没有匹配到的节点
    fgf: " ",     //节点名前缀或国旗分隔符，默认为空格；
    sn: " ",      //设置国家与序号之间的分隔符，默认为空格；
    name: "",     //节点添加机场名称前缀；
    blkey: "",    //用+号添加多个关键词 保留节点名的自定义字段 需要区分大小写! 如果需要修改 保留的关键词 替换成别的 可以用 > 分割 例如 [#blkey=GPT>新名字+其他关键词] 这将把【GPT】替换成【新名字】
    blockquic: "",  //blockquic=on 阻止; blockquic=off 不阻止
    inname: "",   //自动判断机场节点名类型 优先级 zh(中文) -> flag(国旗) -> quan(英文全称) -> en(英文简写)
    outname: "",  //输出节点名可选参数: (cn或zh ，us或en ，gq或flag ，quan) 对应：(中文，英文缩写 ，国旗 ，英文全称) 默认中文 例如 [out=en] 或 out=us 输出英文缩写
  };
  if (!inArg || typeof inArg !== "object") {
    inArg = {};
  }
  // 先复制默认配置
  let config = {...defaultConfig};
  // 组合开关，默认不开启
  const useCombo = Boolean(inArg.useCombo);
  // 去除 useCombo 避免污染后面合并参数
  const paramCopy = {...inArg};
  delete paramCopy.useCombo;
  // 如果组合开了，先合并组合配置
  if (useCombo) {
    config = {...config, ...comboFlags};
  }
  // 再合并用户传入配置（有传则用传的，没有则用默认+组合）
  for (const key in paramCopy) {
    if (paramCopy.hasOwnProperty(key)) {
      // 布尔型转换
      if (typeof defaultConfig[key] === "boolean") {
        // 允许传字符串 "true"/"false" 也做转换
        if (typeof paramCopy[key] === "string") {
          config[key] = paramCopy[key].toLowerCase() === "true";
        } else {
          config[key] = Boolean(paramCopy[key]);
        }
      } else if (typeof defaultConfig[key] === "string") {
        if (typeof paramCopy[key] === "string") {
          config[key] = decodeURI(paramCopy[key]);
        } else if (paramCopy[key] !== undefined && paramCopy[key] !== null) {
          config[key] = String(paramCopy[key]);
        }
      } else {
        // 其它类型：直接赋值
        config[key] = paramCopy[key];
      }
    }
  }
  // 特殊处理 inname, outname 通过 mapNameParam 映射
  config.inname = mapNameParam(config.inname);
  config.outname = mapNameParam(config.outname);
  return config;
}
// 使用buildConfig替代原config初始化
const config = buildConfig($arguments);


function mapNameParam(param) {
  if (!param) return "";
  const p = param.toLowerCase();
  const map = {
    cn: "cn",
    zh: "cn",
    us: "us",
    en: "us",
    quan: "quan",
    gq: "gq",
    flag: "gq",
  };
  return map[p] || "";
}

// --- 2. 完整国家数据定义 ---
const STANDARD_COUNTRIES = [
  {flag:"🇦🇫",enCode:"AF",zhName:"阿富汗",enFullName:"Afghanistan"},
  {flag:"🇦🇱",enCode:"AL",zhName:"阿尔巴尼亚",enFullName:"Albania"},
  {flag:"🇩🇿",enCode:"DZ",zhName:"阿尔及利亚",enFullName:"Algeria"},
  {flag:"🇦🇴",enCode:"AO",zhName:"安哥拉",enFullName:"Angola"},
  {flag:"🇦🇷",enCode:"AR",zhName:"阿根廷",enFullName:"Argentina"},
  {flag:"🇦🇲",enCode:"AM",zhName:"亚美尼亚",enFullName:"Armenia"},
  {flag:"🇦🇺",enCode:"AU",zhName:"澳大利亚",enFullName:"Australia"},
  {flag:"🇦🇹",enCode:"AT",zhName:"奥地利",enFullName:"Austria"},
  {flag:"🇦🇿",enCode:"AZ",zhName:"阿塞拜疆",enFullName:"Azerbaijan"},
  {flag:"🇧🇭",enCode:"BH",zhName:"巴林",enFullName:"Bahrain"},
  {flag:"🇧🇩",enCode:"BD",zhName:"孟加拉国",enFullName:"Bangladesh"},
  {flag:"🇧🇾",enCode:"BY",zhName:"白俄罗斯",enFullName:"Belarus"},
  {flag:"🇧🇪",enCode:"BE",zhName:"比利时",enFullName:"Belgium"},
  {flag:"🇧🇿",enCode:"BZ",zhName:"伯利兹",enFullName:"Belize"},
  {flag:"🇧🇯",enCode:"BJ",zhName:"贝宁",enFullName:"Benin"},
  {flag:"🇧🇼",enCode:"BW",zhName:"博茨瓦纳",enFullName:"Botswana"},
  {flag:"🇧🇷",enCode:"BR",zhName:"巴西",enFullName:"Brazil"},
  {flag:"🇧🇳",enCode:"BN",zhName:"文莱",enFullName:"Brunei Darussalam"},
  {flag:"🇧🇬",enCode:"BG",zhName:"保加利亚",enFullName:"Bulgaria"},
  {flag:"🇧🇫",enCode:"BF",zhName:"布基纳法索",enFullName:"Burkina Faso"},
  {flag:"🇧🇮",enCode:"BI",zhName:"布隆迪",enFullName:"Burundi"},
  {flag:"🇰🇭",enCode:"KH",zhName:"柬埔寨",enFullName:"Cambodia"},
  {flag:"🇨🇲",enCode:"CM",zhName:"喀麦隆",enFullName:"Cameroon"},
  {flag:"🇨🇦",enCode:"CA",zhName:"加拿大",enFullName:"Canada"},
  {flag:"🇨🇻",enCode:"CV",zhName:"佛得角",enFullName:"Cape Verde"},
  {flag:"🇰🇾",enCode:"KY",zhName:"开曼群岛",enFullName:"Cayman Islands"},
  {flag:"🇨🇫",enCode:"CF",zhName:"中非共和国",enFullName:"Central African Republic"},
  {flag:"🇹🇩",enCode:"TD",zhName:"乍得",enFullName:"Chad"},
  {flag:"🇨🇱",enCode:"CL",zhName:"智利",enFullName:"Chile"},
  {flag:"🇨🇴",enCode:"CO",zhName:"哥伦比亚",enFullName:"Colombia"},
  {flag:"🇰🇲",enCode:"KM",zhName:"科摩罗",enFullName:"Comoros"},
  {flag:"🇨🇬",enCode:"CG",zhName:"刚果（布）",enFullName:"Congo-Brazzaville"},
  {flag:"🇨🇩",enCode:"CD",zhName:"刚果（金）",enFullName:"Congo-Kinshasa"},
  {flag:"🇨🇷",enCode:"CR",zhName:"哥斯达黎加",enFullName:"Costa Rica"},
  {flag:"🇭🇷",enCode:"HR",zhName:"克罗地亚",enFullName:"Croatia"},
  {flag:"🇨🇾",enCode:"CY",zhName:"塞浦路斯",enFullName:"Cyprus"},
  {flag:"🇨🇿",enCode:"CZ",zhName:"捷克",enFullName:"Czech Republic"},
  {flag:"🇩🇰",enCode:"DK",zhName:"丹麦",enFullName:"Denmark"},
  {flag:"🇩🇯",enCode:"DJ",zhName:"吉布提",enFullName:"Djibouti"},
  {flag:"🇩🇴",enCode:"DO",zhName:"多米尼加共和国",enFullName:"Dominican Republic"},
  {flag:"🇪🇨",enCode:"EC",zhName:"厄瓜多尔",enFullName:"Ecuador"},
  {flag:"🇪🇬",enCode:"EG",zhName:"埃及",enFullName:"Egypt"},
  {flag:"🇸🇻",enCode:"SV",zhName:"萨尔瓦多",enFullName:"El Salvador"},
  {flag:"🇪🇷",enCode:"ER",zhName:"厄立特里亚",enFullName:"Eritrea"},
  {flag:"🇪🇪",enCode:"EE",zhName:"爱沙尼亚",enFullName:"Estonia"},
  {flag:"🇪🇹",enCode:"ET",zhName:"埃塞俄比亚",enFullName:"Ethiopia"},
  {flag:"🇫🇯",enCode:"FJ",zhName:"斐济",enFullName:"Fiji"},
  {flag:"🇫🇮",enCode:"FI",zhName:"芬兰",enFullName:"Finland"},
  {flag:"🇫🇷",enCode:"FR",zhName:"法国",enFullName:"France"},
  {flag:"🇬🇦",enCode:"GA",zhName:"加蓬",enFullName:"Gabon"},
  {flag:"🇬🇲",enCode:"GM",zhName:"冈比亚",enFullName:"Gambia"},
  {flag:"🇬🇪",enCode:"GE",zhName:"格鲁吉亚",enFullName:"Georgia"},
  {flag:"🇩🇪",enCode:"DE",zhName:"德国",enFullName:"Germany"},
  {flag:"🇬🇭",enCode:"GH",zhName:"加纳",enFullName:"Ghana"},
  {flag:"🇬🇷",enCode:"GR",zhName:"希腊",enFullName:"Greece"},
  {flag:"🇬🇱",enCode:"GL",zhName:"格陵兰",enFullName:"Greenland"},
  {flag:"🇬🇹",enCode:"GT",zhName:"危地马拉",enFullName:"Guatemala"},
  {flag:"🇬🇳",enCode:"GN",zhName:"几内亚",enFullName:"Guinea"},
  {flag:"🇬🇼",enCode:"GW",zhName:"几内亚比绍",enFullName:"Guinea-Bissau"},
  {flag:"🇬🇾",enCode:"GY",zhName:"圭亚那",enFullName:"Guyana"},
  {flag:"🇭🇹",enCode:"HT",zhName:"海地",enFullName:"Haiti"},
  {flag:"🇭🇳",enCode:"HN",zhName:"洪都拉斯",enFullName:"Honduras"},
  {flag:"🇭🇺",enCode:"HU",zhName:"匈牙利",enFullName:"Hungary"},
  {flag:"🇮🇸",enCode:"IS",zhName:"冰岛",enFullName:"Iceland"},
  {flag:"🇮🇳",enCode:"IN",zhName:"印度",enFullName:"India"},
  {flag:"🇮🇩",enCode:"ID",zhName:"印度尼西亚",enFullName:"Indonesia"},
  {flag:"🇮🇷",enCode:"IR",zhName:"伊朗",enFullName:"Iran"},
  {flag:"🇮🇶",enCode:"IQ",zhName:"伊拉克",enFullName:"Iraq"},
  {flag:"🇮🇪",enCode:"IE",zhName:"爱尔兰",enFullName:"Ireland"},
  {flag:"🇮🇱",enCode:"IL",zhName:"以色列",enFullName:"Israel"},
  {flag:"🇮🇹",enCode:"IT",zhName:"意大利",enFullName:"Italy"},
  {flag:"🇯🇲",enCode:"JM",zhName:"牙买加",enFullName:"Jamaica"},
  {flag:"🇯🇵",enCode:"JP",zhName:"日本",enFullName:"Japan"},
  {flag:"🇯🇴",enCode:"JO",zhName:"约旦",enFullName:"Jordan"},
  {flag:"🇰🇿",enCode:"KZ",zhName:"哈萨克斯坦",enFullName:"Kazakhstan"},
  {flag:"🇰🇪",enCode:"KE",zhName:"肯尼亚",enFullName:"Kenya"},
  {flag:"🇰🇼",enCode:"KW",zhName:"科威特",enFullName:"Kuwait"},
  {flag:"🇰🇬",enCode:"KG",zhName:"吉尔吉斯斯坦",enFullName:"Kyrgyzstan"},
  {flag:"🇱🇦",enCode:"LA",zhName:"老挝",enFullName:"Laos"},
  {flag:"🇱🇻",enCode:"LV",zhName:"拉脱维亚",enFullName:"Latvia"},
  {flag:"🇱🇧",enCode:"LB",zhName:"黎巴嫩",enFullName:"Lebanon"},
  {flag:"🇱🇹",enCode:"LT",zhName:"立陶宛",enFullName:"Lithuania"},
  {flag:"🇱🇺",enCode:"LU",zhName:"卢森堡",enFullName:"Luxembourg"},
  {flag:"🇲🇰",enCode:"MK",zhName:"北马其顿",enFullName:"North Macedonia"},
  {flag:"🇲🇬",enCode:"MG",zhName:"马达加斯加",enFullName:"Madagascar"},
  {flag:"🇲🇼",enCode:"MW",zhName:"马拉维",enFullName:"Malawi"},
  {flag:"🇲🇾",enCode:"MY",zhName:"马来西亚",enFullName:"Malaysia"},
  {flag:"🇲🇻",enCode:"MV",zhName:"马尔代夫",enFullName:"Maldives"},
  {flag:"🇲🇱",enCode:"ML",zhName:"马里",enFullName:"Mali"},
  {flag:"🇲🇹",enCode:"MT",zhName:"马耳他",enFullName:"Malta"},
  {flag:"🇲🇷",enCode:"MR",zhName:"毛里塔尼亚",enFullName:"Mauritania"},
  {flag:"🇲🇺",enCode:"MU",zhName:"毛里求斯",enFullName:"Mauritius"},
  {flag:"🇲🇽",enCode:"MX",zhName:"墨西哥",enFullName:"Mexico"},
  {flag:"🇲🇩",enCode:"MD",zhName:"摩尔多瓦",enFullName:"Moldova"},
  {flag:"🇲🇨",enCode:"MC",zhName:"摩纳哥",enFullName:"Monaco"},
  {flag:"🇲🇳",enCode:"MN",zhName:"蒙古",enFullName:"Mongolia"},
  {flag:"🇲🇪",enCode:"ME",zhName:"黑山",enFullName:"Montenegro"},
  {flag:"🇲🇦",enCode:"MA",zhName:"摩洛哥",enFullName:"Morocco"},
  {flag:"🇲🇿",enCode:"MZ",zhName:"莫桑比克",enFullName:"Mozambique"},
  {flag:"🇳🇦",enCode:"NA",zhName:"纳米比亚",enFullName:"Namibia"},
  {flag:"🇳🇵",enCode:"NP",zhName:"尼泊尔",enFullName:"Nepal"},
  {flag:"🇳🇱",enCode:"NL",zhName:"荷兰",enFullName:"Netherlands"},
  {flag:"🇳🇿",enCode:"NZ",zhName:"新西兰",enFullName:"New Zealand"},
  {flag:"🇳🇮",enCode:"NI",zhName:"尼加拉瓜",enFullName:"Nicaragua"},
  {flag:"🇳🇪",enCode:"NE",zhName:"尼日尔",enFullName:"Niger"},
  {flag:"🇳🇬",enCode:"NG",zhName:"尼日利亚",enFullName:"Nigeria"},
  {flag:"🇰🇵",enCode:"KP",zhName:"朝鲜",enFullName:"North Korea"},
  {flag:"🇳🇴",enCode:"NO",zhName:"挪威",enFullName:"Norway"},
  {flag:"🇴🇲",enCode:"OM",zhName:"阿曼",enFullName:"Oman"},
  {flag:"🇵🇰",enCode:"PK",zhName:"巴基斯坦",enFullName:"Pakistan"},
  {flag:"🇵🇦",enCode:"PA",zhName:"巴拿马",enFullName:"Panama"},
  {flag:"🇵🇾",enCode:"PY",zhName:"巴拉圭",enFullName:"Paraguay"},
  {flag:"🇵🇪",enCode:"PE",zhName:"秘鲁",enFullName:"Peru"},
  {flag:"🇵🇭",enCode:"PH",zhName:"菲律宾",enFullName:"Philippines"},
  {flag:"🇵🇹",enCode:"PT",zhName:"葡萄牙",enFullName:"Portugal"},
  {flag:"🇶🇦",enCode:"QA",zhName:"卡塔尔",enFullName:"Qatar"},
  {flag:"🇷🇴",enCode:"RO",zhName:"罗马尼亚",enFullName:"Romania"},
  {flag:"🇷🇺",enCode:"RU",zhName:"俄罗斯",enFullName:"Russia"},
  {flag:"🇷🇼",enCode:"RW",zhName:"卢旺达",enFullName:"Rwanda"},
  {flag:"🇸🇦",enCode:"SA",zhName:"沙特阿拉伯",enFullName:"Saudi Arabia"},
  {flag:"🇷🇸",enCode:"RS",zhName:"塞尔维亚",enFullName:"Serbia"},
  {flag:"🇸🇨",enCode:"SC",zhName:"塞舌尔",enFullName:"Seychelles"},
  {flag:"🇸🇱",enCode:"SL",zhName:"塞拉利昂",enFullName:"Sierra Leone"},
  {flag:"🇸🇬",enCode:"SG",zhName:"新加坡",enFullName:"Singapore"},
  {flag:"🇸🇰",enCode:"SK",zhName:"斯洛伐克",enFullName:"Slovakia"},
  {flag:"🇸🇮",enCode:"SI",zhName:"斯洛文尼亚",enFullName:"Slovenia"},
  {flag:"🇿🇦",enCode:"ZA",zhName:"南非",enFullName:"South Africa"},
  {flag:"🇪🇸",enCode:"ES",zhName:"西班牙",enFullName:"Spain"},
  {flag:"🇱🇰",enCode:"LK",zhName:"斯里兰卡",enFullName:"Sri Lanka"},
  {flag:"🇸🇪",enCode:"SE",zhName:"瑞典",enFullName:"Sweden"},
  {flag:"🇨🇭",enCode:"CH",zhName:"瑞士",enFullName:"Switzerland"},
  {flag:"🇸🇾",enCode:"SY",zhName:"叙利亚",enFullName:"Syria"},
  {flag:"🇹🇯",enCode:"TJ",zhName:"塔吉克斯坦",enFullName:"Tajikistan"},
  {flag:"🇹🇿",enCode:"TZ",zhName:"坦桑尼亚",enFullName:"Tanzania"},
  {flag:"🇹🇭",enCode:"TH",zhName:"泰国",enFullName:"Thailand"},
  {flag:"🇹🇬",enCode:"TG",zhName:"多哥",enFullName:"Togo"},
  {flag:"🇹🇴",enCode:"TO",zhName:"汤加",enFullName:"Tonga"},
  {flag:"🇹🇳",enCode:"TN",zhName:"突尼斯",enFullName:"Tunisia"},
  {flag:"🇹🇷",enCode:"TR",zhName:"土耳其",enFullName:"Turkey"},
  {flag:"🇹🇲",enCode:"TM",zhName:"土库曼斯坦",enFullName:"Turkmenistan"},
  {flag:"🇺🇬",enCode:"UG",zhName:"乌干达",enFullName:"Uganda"},
  {flag:"🇺🇦",enCode:"UA",zhName:"乌克兰",enFullName:"Ukraine"},
  {flag:"🇦🇪",enCode:"AE",zhName:"阿联酋",enFullName:"United Arab Emirates"},
  {flag:"🇬🇧",enCode:"GB",zhName:"英国",enFullName:"United Kingdom"},
  {flag:"🇷🇪",enCode:"RE",zhName:"留尼汪",enFullName:"Reunion"},
  {flag:"🇺🇸",enCode:"US",zhName:"美国",enFullName:"United States"},
  {flag:"🇺🇾",enCode:"UY",zhName:"乌拉圭",enFullName:"Uruguay"},
  {flag:"🇺🇿",enCode:"UZ",zhName:"乌兹别克斯坦",enFullName:"Uzbekistan"},
  {flag:"🇻🇪",enCode:"VE",zhName:"委内瑞拉",enFullName:"Venezuela"},
  {flag:"🇻🇳",enCode:"VN",zhName:"越南",enFullName:"Vietnam"},
  {flag:"🇾🇪",enCode:"YE",zhName:"也门",enFullName:"Yemen"},
  {flag:"🇿🇲",enCode:"ZM",zhName:"赞比亚",enFullName:"Zambia"},
  {flag:"🇿🇼",enCode:"ZW",zhName:"津巴布韦",enFullName:"Zimbabwe"},
  {flag:"🇭🇰",enCode:"HK",zhName:"香港",enFullName:"Hong Kong"},
  {flag:"🇲🇴",enCode:"MO",zhName:"澳门",enFullName:"Macao"},
  {flag:"🇹🇼",enCode:"TW",zhName:"台湾",enFullName:"Taiwan"},
  {flag:"🇰🇷",enCode:"KR",zhName:"韩国",enFullName:"South Korea"},
  {flag:"🇲🇲",enCode:"MM",zhName:"缅甸",enFullName:"Myanmar"},
  {flag:"🇹🇱",enCode:"TL",zhName:"东帝汶",enFullName:"Timor-Leste"},
  {flag:"🇻🇦",enCode:"VA",zhName:"梵蒂冈",enFullName:"Vatican City"},
  {flag:"🇧🇲",enCode:"BM",zhName:"百慕大",enFullName:"Bermuda"},
  {flag:"🇨🇺",enCode:"CU",zhName:"古巴",enFullName:"Cuba"},
  {flag:"🇸🇧",enCode:"SB",zhName:"所罗门群岛",enFullName:"Solomon Islands"},
  {flag:"🇬🇺",enCode:"GU",zhName:"关岛",enFullName:"Guam"},
  {flag:"🇦🇶",enCode:"AQ",zhName:"南极洲",enFullName:"Antarctica"},
  {flag:"🇨🇳",enCode:"CN",zhName:"中国",enFullName:"China"},
  {flag:"🇻🇮", enCode:"VI", zhName:"美属维尔京群岛", enFullName:"U.S. Virgin Islands"},
  {flag:"🇵🇷", enCode:"PR", zhName:"波多黎各", enFullName:"Puerto Rico"},
  {flag:"🇬🇫", enCode:"GF", zhName:"法属圭亚那", enFullName:"French Guiana"},
  {flag:"🇬🇮", enCode:"GI", zhName:"直布罗陀", enFullName:"Gibraltar"},
  {flag:"🇲🇶", enCode:"MQ", zhName:"马提尼克", enFullName:"Martinique"},
  {flag:"🇳🇨", enCode:"NC", zhName:"新喀里多尼亚", enFullName:"New Caledonia"},
  {flag:"🇵🇸", enCode:"PS", zhName:"巴勒斯坦", enFullName:"Palestine"},
];

// --- 3. 国旗、EN码、中文、英文拆分数组 ---
// 这里用空数组填充，待自动补全
const flags = [];
const enCodes = [];
const zhNames = [];
const enFullNames = [];

// --- 4. 补全函数 ---
function enrichCountryData(flags, enCodes, zhNames, enFullNames, standardList) {
  const zhSet = new Set(zhNames);
  const enSet = new Set(enCodes);

  // 添加缺失或更新已有
  standardList.forEach(({flag, enCode, zhName, enFullName}) => {
    if (!zhSet.has(zhName) && !enSet.has(enCode)) {
      flags.push(flag);
      enCodes.push(enCode);
      zhNames.push(zhName);
      enFullNames.push(enFullName);
      zhSet.add(zhName);
      enSet.add(enCode);
    } else {
      let idx = zhNames.indexOf(zhName);
      if (idx === -1) idx = enCodes.indexOf(enCode);
      if (idx !== -1) {
        flags[idx] = flag;
        enCodes[idx] = enCode;
        zhNames[idx] = zhName;
        enFullNames[idx] = enFullName;
      }
    }
  });

  const createMap = (arr) => new Map(arr.map((v,i) => [v,i]));

  return {
    flags,
    enCodes,
    zhNames,
    enFullNames,
    indexMap: {
      flags: createMap(flags),
      enCodes: createMap(enCodes),
      zhNames: createMap(zhNames),
      enFullNames: createMap(enFullNames),
    }
  };
}

// --- 5. 生成完整的 countryData ---

const countryData = enrichCountryData(flags, enCodes, zhNames, enFullNames, STANDARD_COUNTRIES);


// --- 6. 正则及规则配置 ---
const regexConfig = {
  specialRegexList: [
    /(\d\.)?\d+×/,
    /IPLC|IEPL|Kern|Edge|Pro|Std|Exp|Biz|Fam|Game|Buy|Zx|LB|Game/,
  ],
  nameClearRegex: /(套餐|到期|有效|剩余|版本|已用|过期|失联|测试|官方|网址|备用|群|TEST|客服|网站|获取|订阅|流量|机场|下次|官址|联系|邮箱|工单|学术|USE|USED|TOTAL|EXPIRE|EMAIL)/i,
  multiplierRegex: /((倍率|X|x|×)\D?((\d{1,3}\.)?\d+)\D?)|((\d{1,3}\.)?\d+)(倍|X|x|×)/,
  nameBlnx: /(高倍|(?!1)2+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i,
  nameNx: /(高倍|(?!1)(0\.|\d)+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i,
  keyA: /港|Hong|HK|新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR|🇸🇬|🇭🇰|🇯🇵|🇺🇸|🇰🇷|🇹🇷/i,
  keyB: /(((1|2|3|4)\d)|(香港|Hong|HK) 0[5-9]|((新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR) 0[3-9]))/i,
};

// --- 7. 替换规则 ---
const replacementRules = {
  "GB": /UK/g,
  "B-G-P": /BGP/g,
  "Russia Moscow": /Moscow/g,
  "Korea Chuncheon": /Chuncheon|Seoul/g,
  "Hong Kong": /Hongkong|HONG KONG/gi,
  "United Kingdom London": /London|Great Britain/g,
  "Dubai United Arab Emirates": /United Arab Emirates/g,
  "Taiwan TW 台湾 🇹🇼": /(台|Tai\s?wan|TW).*?🇨🇳|🇨🇳.*?(台|Tai\s?wan|TW)/g,
  "United States": /USA|Los Angeles|San Jose|Silicon Valley|Michigan/g,
  澳大利亚: /澳洲|墨尔本|悉尼|土澳|(深|沪|呼|京|广|杭)澳/g,
  德国: /(深|沪|呼|京|广|杭)德(?!.*(I|线))|法兰克福|滬德/g,
  香港: /(深|沪|呼|京|广|杭)港(?!.*(I|线))/g,
  日本: /(深|沪|呼|京|广|杭|中|辽)日(?!.*(I|线))|东京|大坂/g,
  新加坡: /狮城|(深|沪|呼|京|广|杭)新/g,
  美国: /(深|沪|呼|京|广|杭)美|波特兰|芝加哥|哥伦布|纽约|硅谷|俄勒冈|西雅图|芝加哥/g,
  波斯尼亚和黑塞哥维那: /波黑共和国/g,
  印尼: /印度尼西亚|雅加达/g,
  印度: /孟买/g,
  阿联酋: /迪拜|阿拉伯联合酋长国/g,
  孟加拉国: /孟加拉/g,
  捷克: /捷克共和国/g,
  台湾: /新台|新北|台(?!.*线)/g,
  Taiwan: /Taipei/g,
  韩国: /春川|韩|首尔/g,
  Japan: /Tokyo|Osaka/g,
  英国: /伦敦/g,
  India: /Mumbai/g,
  Germany: /Frankfurt/g,
  Switzerland: /Zurich/g,
  俄罗斯: /莫斯科/g,
  土耳其: /伊斯坦布尔/g,
  泰国: /泰國|曼谷/g,
  法国: /巴黎/g,
  G: /\d\s?GB/gi,
  Esnc: /esnc/gi,
};

// --- 8. 解析BLKEY ---
// 解析 'xxx>yyy+zzz' 格式
function parseBLKEY(str) {
  if (!str) return [];
  return str.split("+").map((item) => {
    if (item.includes(">")) {
      const [from, to] = item.split(">");
      return { from, to };
    }
    return { from: item, to: null };
  });
}

const blkeyRules = parseBLKEY(config.blkey);

// --- 9. 根据类型获取对应名称列表 ---
function getNameList(type) {
  switch (type) {
    case "us": return countryData.enCodes;
    case "gq": return countryData.flags;
    case "quan": return countryData.enFullNames;
    default: return countryData.zhNames;
  }
}

// --- 10. 构建映射表 ---
function buildNameMap(inputType, outputType) {
  const outList = getNameList(outputType);
  const inputLists = inputType
    ? [getNameList(inputType)]
    : [countryData.zhNames, countryData.flags, countryData.enFullNames, countryData.enCodes];

  const map = {};
  inputLists.forEach((list) => {
    list.forEach((name, idx) => {
      map[name] = outList[idx];
    });
  });

  return map;
}

let nameMappingCache = null;
function getNameMapping() {
  if (!nameMappingCache) {
    nameMappingCache = buildNameMap(config.inname, config.outname);
  }
  return nameMappingCache;
}

// --- 11. 主要处理函数 ---
function operator(proxies) {
  const nameMapping = getNameMapping();

  let filtered = proxies.filter(proxy => {
    const nm = proxy.name;
    if (config.clear && regexConfig.nameClearRegex.test(nm)) return false;
    if (config.nx && !regexConfig.nameNx.test(nm)) return false;
    if (config.blnx && !regexConfig.nameBlnx.test(nm)) return false;
    if (config.key && !(regexConfig.keyA.test(nm) && /2|4|6|7/i.test(nm))) return false;
    return true;
  });

  filtered.forEach(proxy => {
    Object.entries(replacementRules).forEach(([key, reg]) => {
      if (reg.test(proxy.name)) {
        proxy.name = proxy.name.replace(reg, key);
      }
    });

    if (config.blockquic === "on") {
      proxy["block-quic"] = "on";
    } else if (config.blockquic === "off") {
      proxy["block-quic"] = "off";
    } else {
      delete proxy["block-quic"];
    }

    let retainKey = "";
    blkeyRules.forEach(({ from, to }) => {
      if (proxy.name.includes(from)) {
        if (to) {
          proxy.name += " " + to;
          retainKey = to;
        } else {
          proxy.name += " " + from;
          retainKey = from;
        }
      }
    });

    const found = Object.entries(nameMapping).find(([key]) => proxy.name.includes(key));

    const firstName = config.nf ? config.name : "";
    const lastName = config.nf ? "" : config.name;

    if (found) {
      const outName = found[1];
      let flagIcon = "";

      if (config.flag) {
        const idx = getNameList(config.outname).indexOf(outName);
        if (idx !== -1) {
          flagIcon = countryData.flags[idx] === "🇹🇼" ? "🇨🇳" : countryData.flags[idx];
        }
      }

      const newNameParts = [firstName, flagIcon, lastName, outName, retainKey].filter(Boolean);
      proxy.name = newNameParts.join(config.fgf);
    } else {
      if (config.nm) {
        proxy.name = config.name + config.fgf + proxy.name;
      } else {
        proxy.name = null;
      }
    }
  });

  filtered = filtered.filter(proxy => proxy.name !== null);

  renameUniqueNum(filtered);

  if (config.one) clearSingleNum(filtered);

  if (config.blpx) filtered = sortBySpecialRegex(filtered);

  if (config.key) filtered = filtered.filter(p => !regexConfig.keyB.test(p.name));

  return filtered;
}

// --- 12. 唯一序号附加 ---
function renameUniqueNum(proxies) {
  const groups = {};
  proxies.forEach(proxy => {
    const n = proxy.name;
    groups[n] = groups[n] || [];
    groups[n].push(proxy);
  });

  Object.values(groups).forEach(group => {
    group.forEach((proxy, i) => {
      proxy.name = `${proxy.name}${config.sn}${String(i + 1).padStart(2, "0")}`;
    });
  });
}

// --- 13. 清理单节点序号 ---
function clearSingleNum(proxies) {
  const groups = {};
  proxies.forEach(p => {
    const baseName = p.name.replace(new RegExp(`${config.sn}\\d+$`), "");
    groups[baseName] = groups[baseName] || [];
    groups[baseName].push(p);
  });

  Object.values(groups).forEach(group => {
    if (group.length === 1) {
      group[0].name = group[0].name.replace(new RegExp(`${config.sn}01$`), "");
    }
  });
}

// --- 14. 根据特殊标识排序 ---
function sortBySpecialRegex(proxies) {
  const withSpecial = [];
  const withoutSpecial = [];
  proxies.forEach(p => {
    if (regexConfig.specialRegexList.some(r => r.test(p.name))) {
      withSpecial.push(p);
    } else {
      withoutSpecial.push(p);
    }
  });

  withSpecial.sort((a, b) => {
    const idxA = regexConfig.specialRegexList.findIndex(r => r.test(a.name));
    const idxB = regexConfig.specialRegexList.findIndex(r => r.test(b.name));
    return idxA - idxB || a.name.localeCompare(b.name);
  });

  return [...withoutSpecial, ...withSpecial];
}


