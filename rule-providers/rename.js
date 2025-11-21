/**
 * rename_optimized.js
 * 优化版本 rename.js
 * 2024-06-xx
 */

const inArg = $arguments; // 运行环境传入参数

// --- 1. 基础配置解析 ---
const config = {
  nx: Boolean(inArg.nx),
  bl: Boolean(inArg.bl),
  nf: Boolean(inArg.nf),
  key: Boolean(inArg.key),
  blgd: Boolean(inArg.blgd),
  blpx: Boolean(inArg.blpx),
  blnx: Boolean(inArg.blnx),
  one: Boolean(inArg.one),
  debug: Boolean(inArg.debug),
  clear: Boolean(inArg.clear),
  flag: Boolean(inArg.flag),
  nm: Boolean(inArg.nm),
  fgf: inArg.fgf === undefined ? " " : decodeURI(inArg.fgf),
  sn: inArg.sn === undefined ? " " : decodeURI(inArg.sn),
  name: inArg.name === undefined ? "" : decodeURI(inArg.name),
  blkey: inArg.blkey === undefined ? "" : decodeURI(inArg.blkey),
  blockquic: inArg.blockquic === undefined ? "" : decodeURI(inArg.blockquic),
  inname: mapNameParam(inArg.in),
  outname: mapNameParam(inArg.out),
};

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

// --- 2. 国家数据（国旗、简称、中文、全称）---
// 注意: 这里仅以示例方式展示部分数据，完整请替换您的全量数组
const countryData = (() => {
const FG = ['🇭🇰','🇲🇴','🇹🇼','🇯🇵','🇰🇷','🇸🇬','🇺🇸','🇬🇧','🇫🇷','🇩🇪','🇦🇺','🇦🇪','🇦🇫','🇦🇱','🇩🇿','🇦🇴','🇦🇷','🇦🇲','🇦🇹','🇦🇿','🇧🇭','🇧🇩','🇧🇾','🇧🇪','🇧🇿','🇧🇯','🇧🇹','🇧🇴','🇧🇦','🇧🇼','🇧🇷','🇻🇬','🇧🇳','🇧🇬','🇧🇫','🇧🇮','🇰🇭','🇨🇲','🇨🇦','🇨🇻','🇰🇾','🇨🇫','🇹🇩','🇨🇱','🇨🇴','🇰🇲','🇨🇬','🇨🇩','🇨🇷','🇭🇷','🇨🇾','🇨🇿','🇩🇰','🇩🇯','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🇬🇶','🇪🇷','🇪🇪','🇪🇹','🇫🇯','🇫🇮','🇬🇦','🇬🇲','🇬🇪','🇬🇭','🇬🇷','🇬🇱','🇬🇹','🇬🇳','🇬🇾','🇭🇹','🇭🇳','🇭🇺','🇮🇸','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪','🇮🇲','🇮🇱','🇮🇹','🇨🇮','🇯🇲','🇯🇴','🇰🇿','🇰🇪','🇰🇼','🇰🇬','🇱🇦','🇱🇻','🇱🇧','🇱🇸','🇱🇷','🇱🇾','🇱🇹','🇱🇺','🇲🇰','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱','🇲🇹','🇲🇷','🇲🇺','🇲🇽','🇲🇩','🇲🇨','🇲🇳','🇲🇪','🇲🇦','🇲🇿','🇲🇲','🇳🇦','🇳🇵','🇳🇱','🇳🇿','🇳🇮','🇳🇪','🇳🇬','🇰🇵','🇳🇴','🇴🇲','🇵🇰','🇵🇦','🇵🇾','🇵🇪','🇵🇭','🇵🇹','🇵🇷','🇶🇦','🇷🇴','🇷🇺','🇷🇼','🇸🇲','🇸🇦','🇸🇳','🇷🇸','🇸🇱','🇸🇰','🇸🇮','🇸🇴','🇿🇦','🇪🇸','🇱🇰','🇸🇩','🇸🇷','🇸🇿','🇸🇪','🇨🇭','🇸🇾','🇹🇯','🇹🇿','🇹🇭','🇹🇬','🇹🇴','🇹🇹','🇹🇳','🇹🇷','🇹🇲','🇻🇮','🇺🇬','🇺🇦','🇺🇾','🇺🇿','🇻🇪','🇻🇳','🇾🇪','🇿🇲','🇿🇼','🇦🇩','🇷🇪','🇵🇱','🇬🇺','🇻🇦','🇱🇮','🇨🇼','🇸🇨','🇦🇶','🇬🇮','🇨🇺','🇫🇴','🇦🇽','🇧🇲','🇹🇱'];
const EN = ['HK','MO','TW','JP','KR','SG','US','GB','FR','DE','AU','AE','AF','AL','DZ','AO','AR','AM','AT','AZ','BH','BD','BY','BE','BZ','BJ','BT','BO','BA','BW','BR','VG','BN','BG','BF','BI','KH','CM','CA','CV','KY','CF','TD','CL','CO','KM','CG','CD','CR','HR','CY','CZ','DK','DJ','DO','EC','EG','SV','GQ','ER','EE','ET','FJ','FI','GA','GM','GE','GH','GR','GL','GT','GN','GY','HT','HN','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','CI','JM','JO','KZ','KE','KW','KG','LA','LV','LB','LS','LR','LY','LT','LU','MK','MG','MW','MY','MV','ML','MT','MR','MU','MX','MD','MC','MN','ME','MA','MZ','MM','NA','NP','NL','NZ','NI','NE','NG','KP','NO','OM','PK','PA','PY','PE','PH','PT','PR','QA','RO','RU','RW','SM','SA','SN','RS','SL','SK','SI','SO','ZA','ES','LK','SD','SR','SZ','SE','CH','SY','TJ','TZ','TH','TG','TO','TT','TN','TR','TM','VI','UG','UA','UY','UZ','VE','VN','YE','ZM','ZW','AD','RE','PL','GU','VA','LI','CW','SC','AQ','GI','CU','FO','AX','BM','TL'];
const ZH = ['香港','澳门','台湾','日本','韩国','新加坡','美国','英国','法国','德国','澳大利亚','阿联酋','阿富汗','阿尔巴尼亚','阿尔及利亚','安哥拉','阿根廷','亚美尼亚','奥地利','阿塞拜疆','巴林','孟加拉国','白俄罗斯','比利时','伯利兹','贝宁','不丹','玻利维亚','波斯尼亚和黑塞哥维那','博茨瓦纳','巴西','英属维京群岛','文莱','保加利亚','布基纳法索','布隆迪','柬埔寨','喀麦隆','加拿大','佛得角','开曼群岛','中非共和国','乍得','智利','哥伦比亚','科摩罗','刚果(布)','刚果(金)','哥斯达黎加','克罗地亚','塞浦路斯','捷克','丹麦','吉布提','多米尼加共和国','厄瓜多尔','埃及','萨尔瓦多','赤道几内亚','厄立特里亚','爱沙尼亚','埃塞俄比亚','斐济','芬兰','加蓬','冈比亚','格鲁吉亚','加纳','希腊','格陵兰','危地马拉','几内亚','圭亚那','海地','洪都拉斯','匈牙利','冰岛','印度','印尼','伊朗','伊拉克','爱尔兰','马恩岛','以色列','意大利','科特迪瓦','牙买加','约旦','哈萨克斯坦','肯尼亚','科威特','吉尔吉斯斯坦','老挝','拉脱维亚','黎巴嫩','莱索托','利比里亚','利比亚','立陶宛','卢森堡','马其顿','马达加斯加','马拉维','马来','马尔代夫','马里','马耳他','毛利塔尼亚','毛里求斯','墨西哥','摩尔多瓦','摩纳哥','蒙古','黑山共和国','摩洛哥','莫桑比克','缅甸','纳米比亚','尼泊尔','荷兰','新西兰','尼加拉瓜','尼日尔','尼日利亚','朝鲜','挪威','阿曼','巴基斯坦','巴拿马','巴拉圭','秘鲁','菲律宾','葡萄牙','波多黎各','卡塔尔','罗马尼亚','俄罗斯','卢旺达','圣马力诺','沙特阿拉伯','塞内加尔','塞尔维亚','塞拉利昂','斯洛伐克','斯洛文尼亚','索马里','南非','西班牙','斯里兰卡','苏丹','苏里南','斯威士兰','瑞典','瑞士','叙利亚','塔吉克斯坦','坦桑尼亚','泰国','多哥','汤加','特立尼达和多巴哥','突尼斯','土耳其','土库曼斯坦','美属维尔京群岛','乌干达','乌克兰','乌拉圭','乌兹别克斯坦','委内瑞拉','越南','也门','赞比亚','津巴布韦','安道尔','留尼汪','波兰','关岛','梵蒂冈','列支敦士登','库拉索','塞舌尔','南极','直布罗陀','古巴','法罗群岛','奥兰群岛','百慕达','东帝汶'];
const QC = ['Hong Kong','Macao','Taiwan','Japan','Korea','Singapore','United States','United Kingdom','France','Germany','Australia','Dubai','Afghanistan','Albania','Algeria','Angola','Argentina','Armenia','Austria','Azerbaijan','Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','British Virgin Islands','Brunei','Bulgaria','Burkina-faso','Burundi','Cambodia','Cameroon','Canada','CapeVerde','CaymanIslands','Central African Republic','Chad','Chile','Colombia','Comoros','Congo-Brazzaville','Congo-Kinshasa','CostaRica','Croatia','Cyprus','Czech Republic','Denmark','Djibouti','Dominican Republic','Ecuador','Egypt','EISalvador','Equatorial Guinea','Eritrea','Estonia','Ethiopia','Fiji','Finland','Gabon','Gambia','Georgia','Ghana','Greece','Greenland','Guatemala','Guinea','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Isle of Man','Israel','Italy','Ivory Coast','Jamaica','Jordan','Kazakstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Lithuania','Luxembourg','Macedonia','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar(Burma)','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','NorthKorea','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Portugal','PuertoRico','Qatar','Romania','Russia','Rwanda','SanMarino','SaudiArabia','Senegal','Serbia','SierraLeone','Slovakia','Slovenia','Somalia','SouthAfrica','Spain','SriLanka','Sudan','Suriname','Swaziland','Sweden','Switzerland','Syria','Tajikstan','Tanzania','Thailand','Togo','Tonga','TrinidadandTobago','Tunisia','Turkey','Turkmenistan','U.S.Virgin Islands','Uganda','Ukraine','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe','Andorra','Reunion','Poland','Guam','Vatican','Liechtensteins','Curacao','Seychelles','Antarctica','Gibraltar','Cuba','Faroe Islands','Ahvenanmaa','Bermuda','Timor-Leste'];

  const createIndexMap = (arr) => {
    const map = new Map();
    arr.forEach((v, i) => map.set(v, i));
    return map;
  };

  return {
    flags,
    enCodes,
    zhNames,
    enFullNames,
    indexMap: {
      flags: createIndexMap(flags),
      enCodes: createIndexMap(enCodes),
      zhNames: createIndexMap(zhNames),
      enFullNames: createIndexMap(enFullNames),
    },
  };
})();

// --- 3. 正则及规则配置 ---
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

// --- 4. 替换规则 ---
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

// --- 5. 解析BLKEY ---
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

// --- 6. 根据类型获取对应名称列表 ---
function getNameList(type) {
  switch (type) {
    case "us": return countryData.enCodes;
    case "gq": return countryData.flags;
    case "quan": return countryData.enFullNames;
    default: return countryData.zhNames;
  }
}

// --- 7. 构建映射表 ---
function buildNameMap(inputType, outputType) {
  const outList = getNameList(outputType);
  const inputLists = inputType ? [getNameList(inputType)] : [countryData.zhNames, countryData.flags, countryData.enFullNames, countryData.enCodes];

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

// --- 8. 主要处理函数 ---
function operator(proxies) {
  const nameMapping = getNameMapping();

  // 过滤清理
  let filtered = proxies.filter(proxy => {
    const nm = proxy.name;
    if (config.clear && regexConfig.nameClearRegex.test(nm)) return false;
    if (config.nx && !regexConfig.nameNx.test(nm)) return false;
    if (config.blnx && !regexConfig.nameBlnx.test(nm)) return false;
    if (config.key && !(regexConfig.keyA.test(nm) && /2|4|6|7/i.test(nm))) return false;
    return true;
  });

  filtered.forEach(proxy => {
    // 预处理替换规则
    Object.entries(replacementRules).forEach(([key, reg]) => {
      if (reg.test(proxy.name)) {
        proxy.name = proxy.name.replace(reg, key);
      }
    });

    // block-quic处理
    if (config.blockquic === "on") {
      proxy["block-quic"] = "on";
    } else if (config.blockquic === "off") {
      proxy["block-quic"] = "off";
    } else {
      delete proxy["block-quic"];
    }

    // BLKEY关键词处理 - 保留或替换
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

    // 匹配映射国家名称
    const found = Object.entries(nameMapping).find(([key]) => proxy.name.includes(key));

    // 名称构建
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

// --- 9. 唯一序号附加 ---
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

// --- 10. 清理单节点序号 ---
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

// --- 11. 根据特殊标识排序 ---
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


