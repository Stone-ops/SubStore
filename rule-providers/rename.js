/**
 * 优化后的 rename.js 脚本
 * 2024-06更新版
 */

const inArg = $arguments;

const {
  nx = false,
  bl = false,
  nf = false,
  key = false,
  blgd = false,
  blpx = false,
  blnx = false,
  one: numone = false,
  debug = false,
  clear = false,
  flag: addflag = false,
  nm = false,
  fgf: rawFGF,
  sn: rawXHFGF,
  name: rawFNAME,
  blkey: rawBLKEY,
  blockquic: rawBlockQuic,
  in: rawIn,
  out: rawOut,
} = inArg;

const FGF = rawFGF === undefined ? " " : decodeURIComponent(rawFGF);
const XHFGF = rawXHFGF === undefined ? " " : decodeURIComponent(rawXHFGF);
const FNAME = rawFNAME === undefined ? "" : decodeURIComponent(rawFNAME);
const BLKEY = rawBLKEY === undefined ? "" : decodeURIComponent(rawBLKEY);
const blockquic = rawBlockQuic === undefined ? "" : decodeURIComponent(rawBlockQuic);

// 映射简写
const nameMap = {
  cn: "cn", zh: "cn",
  us: "us", en: "us",
  gq: "gq", flag: "gq",
  quan: "quan",
};

const inname = nameMap[rawIn] || "";
const outputName = nameMap[rawOut] || "cn";

const FG = ['🇭🇰','🇲🇴','🇹🇼','🇯🇵','🇰🇷','🇸🇬','🇺🇸','🇬🇧','🇫🇷','🇩🇪','🇦🇺',/*省略...*/];
const EN = ['HK','MO','TW','JP','KR','SG','US','GB','FR','DE','AU',/*省略...*/];
const ZH = ['香港','澳门','台湾','日本','韩国','新加坡','美国','英国','法国','德国','澳大利亚',/*省略...*/];
const QC = ['Hong Kong','Macao','Taiwan','Japan','Korea','Singapore','United States','United Kingdom','France','Germany','Australia',/*省略...*/];

// 正则和替换预设
const specialRegex = [
  /(\d\.)?\d+×/,
  /IPLC|IEPL|Kern|Edge|Pro|Std|Exp|Biz|Fam|Game|Buy|Zx|LB|Game/i,
];
const regexArray = [/ˣ²/, /ˣ³/, /ˣ⁴/, /ˣ⁵/, /ˣ⁶/, /ˣ⁷/, /ˣ⁸/, /ˣ⁹/, /ˣ¹⁰/, /ˣ²⁰/, /ˣ³⁰/, /ˣ⁴⁰/, /ˣ⁵⁰/, /IPLC/i, /IEPL/i, /核心/, /边缘/, /高级/, /标准/, /实验/, /商宽/, /家宽/, /游戏|game/i, /购物/, /专线/, /LB/, /cloudflare/i, /\budp\b/i, /\bgpt\b/i, /udpn\b/i];
const valueArray = ["2×","3×","4×","5×","6×","7×","8×","9×","10×","20×","30×","40×","50×","IPLC","IEPL","Kern","Edge","Pro","Std","Exp","Biz","Fam","Game","Buy","Zx","LB","CF","UDP","GPT","UDPN"];

const nameclear = /(套餐|到期|有效|剩余|版本|已用|过期|失联|测试|官方|网址|备用|群|TEST|客服|网站|获取|订阅|流量|机场|下次|官址|联系|邮箱|工单|学术|USE|USED|TOTAL|EXPIRE|EMAIL)/i;
const nameblnx = /(高倍|(?!1)2+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
const namenx = /(高倍|(?!1)(0\.|\d)+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;

const keya = /港|Hong|HK|新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR|🇸🇬|🇭🇰|🇯🇵|🇺🇸|🇰🇷|🇹🇷/i;
const keyb = /(((1|2|3|4)\d)|(香港|Hong|HK) 0[5-9]|((新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR) 0[3-9]))/i;

const rurekey = {
  GB: /UK/g,
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

// 全局映射缓存
let AMK = null;

const getList = (arg) => {
  switch(arg) {
    case 'us': return EN;
    case 'gq': return FG;
    case 'quan': return QC;
    default: return ZH;
  }
};

function buildAllMap(outputName) {
  // 根据指定输出维度建立映射，支持多源映射
  const allMap = {};
  const outList = getList(outputName);
  const inputLists = inname ? [getList(inname)] : [ZH, FG, QC, EN];

  inputLists.forEach(list => {
    list.forEach((val, idx) => {
      if (outList[idx]) allMap[val] = outList[idx];
    });
  });

  return allMap;
}

// 过滤不合适的节点名字
function filterNodes(list) {
  return list.filter(({name}) => {
    if (clear && nameclear.test(name)) return false;
    if (nx && namenx.test(name)) return false;
    if (blnx && !nameblnx.test(name)) return false;
    if (key && !(keya.test(name) && /2|4|6|7/i.test(name))) return false;
    return true;
  });
}

function applyRename(proList) {
  const allMap = buildAllMap(outputName);
  AMK = Object.entries(allMap);

  const BLKEYS = BLKEY ? BLKEY.split("+") : [];

  proList.forEach(item => {
    let originalName = item.name;
    let retainKey = "";
    let replaced = false;

    // 用规则替换名称
    for (const [key, reg] of Object.entries(rurekey)) {
      if (reg.test(item.name)) {
        item.name = item.name.replace(reg, key);
        replaced = true;

        if (BLKEY) {
          BLKEYS.forEach(bk => {
            const [src, dest] = bk.includes(">") ? bk.split(">") : [bk, null];
            if (originalName.includes(src)) {
              if (dest) retainKey = dest;
              if (!item.name.includes(src)) item.name += " " + src;
            }
          });
        }
      }
    }

    // 处理 blockquic
    if (blockquic === "on") item["block-quic"] = "on";
    else if (blockquic === "off") item["block-quic"] = "off";
    else delete item["block-quic"];

    // 自定义保留关键字处理
    if (!replaced && BLKEY) {
      BLKEYS.forEach(bk => {
        const [src, dest] = bk.includes(">") ? bk.split(">") : [bk, null];
        if (item.name.includes(src)) {
          if (dest) retainKey = dest;
        }
      });
    }

    // 提取倍率信息
    let ikey = "";
    let ikeys = "";
    if (blgd) {
      regexArray.forEach((rg, i) => {
        if (rg.test(item.name)) ikeys = valueArray[i];
      });
    }

    if (bl) {
      const match = item.name.match(/((倍率|X|x|×)\D?((\d{1,3}\.)?\d+)\D?)|((\d{1,3}\.)?\d+)(倍|X|x|×)/);
      if (match) {
        const rev = match[0].match(/(\d[\d.]*)/)[0];
        if (rev !== "1") ikey = rev + "×";
      }
    }

    // 查找匹配的输出字段
    const findKeyEntry = AMK.find(([key]) => item.name.includes(key));

    const firstPrefix = nf ? FNAME : "";
    const lastPrefix = nf ? "" : FNAME;

    if (findKeyEntry) {
      const [, mappedVal] = findKeyEntry;
      let flagChar = "";

      if (addflag) {
        const outList = getList(outputName);
        const idx = outList.indexOf(mappedVal);
        if (idx !== -1) {
          flagChar = FG[idx] === '🇹🇼' ? '🇨🇳' : FG[idx];
        }
      }

      // 组合新的名称
      const parts = [firstPrefix, flagChar, lastPrefix, mappedVal, retainKey, ikey, ikeys]
        .filter(Boolean);

      item.name = parts.join(FGF);
    } else {
      if (nm) {
        item.name = `${FNAME}${FGF}${item.name}`;
      } else {
        item.name = null;
      }
    }
  });

  // 删除无效项
  return proList.filter(({name}) => name !== null);
}

// 序号排序函数，保留原有逻辑，优化变量和结构
function sequenceProxyList(list) {
  const grouped = list.reduce((acc, item) => {
    let existingGroup = acc.find(g => g.name === item.name);
    if (existingGroup) {
      existingGroup.count++;
      const suffix = existingGroup.count.toString().padStart(2, "0");
      existingGroup.items.push({ ...item, name: `${item.name}${XHFGF}${suffix}` });
    } else {
      acc.push({ name: item.name, count: 1, items: [{ ...item, name: `${item.name}${XHFGF}01` }] });
    }
    return acc;
  }, []);

  // 扁平化结果
  const flatList = Array.prototype.flatMap
    ? grouped.flatMap(group => group.items)
    : grouped.reduce((acc, group) => acc.concat(group.items), []);

  // 原地替换
  list.splice(0, list.length, ...flatList);
  return list;
}

// 去除只有一个序号的节点的“01”
function cleanSingleIndex(list) {
  const groups = list.reduce((acc, item) => {
    const baseName = item.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/, "");
    if (!acc[baseName]) acc[baseName] = [];
    acc[baseName].push(item);
    return acc;
  }, {});

  for (const baseName in groups) {
    if (groups[baseName].length === 1 && groups[baseName][0].name.endsWith("01")) {
      groups[baseName][0].name = groups[baseName][0].name.replace(/[^.]01$/, "");
    }
  }
  return list;
}

// 处理带特殊标识的排序
function specialSort(proxies) {
  const special = [];
  const normal = [];
  const findSpecialIndex = (name) => specialRegex.findIndex(rx => rx.test(name));

  for (const p of proxies) {
    if (specialRegex.some(rx => rx.test(p.name))) special.push(p);
    else normal.push(p);
  }

  const specialWithIndex = special.map(p => ({ p, idx: findSpecialIndex(p.name) }));

  specialWithIndex.sort((a, b) => a.idx - b.idx || a.p.name.localeCompare(b.p.name));

  normal.sort((a, b) => proxies.indexOf(a) - proxies.indexOf(b));

  return normal.concat(specialWithIndex.map(s => s.p));
}

// 主操作函数
function operator(proxies) {
  // 预过滤
  if (clear || nx || blnx || key) {
    proxies = filterNodes(proxies);
  }
  proxies = applyRename(proxies);

  // 处理序号
  sequenceProxyList(proxies);
  if (numone) cleanSingleIndex(proxies);

  // 分组排序
  if (blpx) proxies = specialSort(proxies);

  // 关键字过滤
  if (key) {
    proxies = proxies.filter(p => !keyb.test(p.name));
  }

  return proxies;
}
