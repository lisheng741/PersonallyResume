//by lisheng741@qq.com
//转载请保留作者信息，谢谢~

const consoleTypingInterval = 120; //控制台打字速度
const commonTypingInterval = 20; //通用打字速度
const autoStartup = 6000; //不双击6秒自动启动

let typingInterval = commonTypingInterval;
let bolStartup = false;

$(document).ready(function() {
    //运行入口
    step1(() => {
        console.log("step1 结束");
        step2();
    });

    //绑定 .program 绑定
    $(document).on("dblclick", ".program", () => {
        programClick();
    });
});

//第一步，控制台打印
function step1(callback) {
    if (lstConsole == undefined || lstConsole.length == 0) {
        console.error("createResume方法缺少必要参数lstConsole");
        return;
    }
    typingInterval = consoleTypingInterval; //初始修改
    consoleAddLine(lstConsole.length, 1, () => {
        typingInterval = commonTypingInterval; //结束恢复
        $(".console").hide();
        if (typeof(callback) == "function") {
            callback();
        }
    });
}

//第二步，启动动画，并等待 双击.program
function step2(callback) {
    $("body").addClass("show-body-background");

    setTimeout(() => {
        programClick();
    }, autoStartup);
}

function programClick() {
    if (bolStartup) {
        return;
    }
    bolStartup = true;
    $(".shadow").addClass("show-shadow-spread");
    $(".program").addClass("show-program-click");
    setTimeout(() => {
        $(".shadow").removeClass("show-shadow-spread");
        $(".program").removeClass("show-program-click");
        $(".program").addClass("show-program-exit");
    }, 2500);
    setTimeout(() => {
        $(".page,.code").addClass("show");
        $(".code[data-type=html]").addClass("show-html-open");
        $(".code[data-type=css]").addClass("show-css-open");
        setTimeout(() => {
            //创建简历
            createResume("", "", "");
        }, 2200);
    }, 1100);
}

//创建简历
function createResume(mainSelector, htmlSelector, cssSelector, callback) {
    if (lstHtml == undefined || lstCss == undefined || lstHtml.length == 0 || lstCss.length == 0) {
        console.error("createResume方法缺少必要参数lstHtml和lstCss");
        return;
    }

    mainSelector = mainSelector || ".main";
    htmlSelector = htmlSelector || ".code-html";
    cssSelector = cssSelector || ".code-css";
    let oMain = $(mainSelector);
    let oHtml = $(htmlSelector);
    let oCss = $(cssSelector);
    if (oMain.length == 0) {
        console.error("createResume方法缺少main容器");
        return;
    }
    //打印 html
    addHtml(oMain, oHtml, lstHtml, 0, 0, () => {
        console.log("addHtml 结束");
        addCss(oCss, 0, () => {
            console.log("addCss 结束");
        })
        if (typeof(callback) == "function") {
            callback();
        }
    });
    /* //打印 html 循环方式，放弃（会因为同步问题产生错乱） //改用递归模式
    let iCount = 0;
    for (let i = 0; i < lstHtml.length; i++) {
        setTimeout(() => {
             typingHtml(oMain, oHtml, lstHtml[i], 0)
         }, iCount * typingInterval);
         iCount = iCount + lstHtml[i].length;
    } */
}

//以下方法有两种递归调用
// consoleAddLine() 加 typing() 结合起来递归
// addHtml() 单独使用递归

//控制台打印行，递归调用： consoleAddLine -> typing
//依赖于全局数组 lstConsole
function consoleAddLine(n, i, callback) {
    if (i >= n) { //递归结束
        if (typeof(callback) == "function") {
            callback();
        }
        return;
    }
    let oConsole = $(".console");
    let oDiv = $("<div></div>").text(lstConsole[0]);
    oConsole.append(oDiv);
    typing(oDiv, lstConsole[i], 0, () => {
        consoleAddLine(n, i + 1, callback); //递归调用
    });
}

//单层递归调用 打印字符串（通用打印）
function typing(oTyping, str, n, callback) {
    setTimeout(() => { //递归结束
        if (n >= str.length) {
            if (typeof(callback) == "function") {
                callback();
            }
            return;
        }
        //oTyping.scrollTop(oTyping[0].scrollHeight);
        oTyping.parent().scrollTop(oTyping.parent()[0].scrollHeight);
        //oTyping.text(oTyping.text() + str[n]);
        oTyping.html(oTyping.html() + str[n]);
        typing(oTyping, str, n + 1, callback); //递归调用
    }, typingInterval);
}

//单层递归调用 //弃用
function typingHtml(oMain, oTyping, str, n) {
    if (n < str.length) {
        setTimeout(() => {
            oTyping.append(str[n]);
            typingHtml(oMain, oTyping, str, n + 1); //递归
        }, typingInterval);
    } else {
        oTyping.append("\n");
        oTyping.scrollTop(oTyping[0].scrollHeight);
        oMain.append(str);
    }
}

//双层递归
function addHtml(oMain, oTyping, lstStr, n, m, callback) {
    if (n < lstStr.length) {
        if (m < lstStr[n].length) {
            setTimeout(() => {
                oTyping.scrollTop(oTyping[0].scrollHeight);
                oTyping.append(lstStr[n][m]);
                addHtml(oMain, oTyping, lstStr, n, m + 1, callback); //递归 m
            }, typingInterval);
        } else {
            regHtml(oTyping);
            oTyping.append("\n");
            oMain.append(lstStr[n]);
            //oMain.parent().scrollTop(oMain[0].scrollHeight);
            oMain.scrollTop(oMain[0].scrollHeight);
            //oTyping.scrollTop(oTyping[0].scrollHeight);
            setTimeout(() => {
                addHtml(oMain, oTyping, lstStr, n + 1, 0, callback); //递归 n
            }, typingInterval);
        }
    } else {
        //全部递归结束 回调
        if (typeof(callback) == "function") {
            callback();
        }
    }
}

//匹配 html 标签，高亮
function regHtml(oHtml) {
    let sHtml = oHtml.text();
    sHtml = sHtml.replace(/<([^>]+)>/g, "<<span class=\"html-label\">$1</span>>"); //&lt; < &gt; >
    //oHtml.html(sHtml); //如果代码里面添加引号时为单引号，则这两句必须取消注释
    //sHtml = oHtml.html();
    sHtml = sHtml.replace(/='([^']+)'/g, "=<span class=\"html-str\">'$1'</span>"); // ///=('{1}([^']+)('))/g
    oHtml.html(sHtml);
}

//添加css，递归调用(三层) addCss -> addStyle -> typing
//相比 addHtml 少了 oMain，因为不需要指定内容生成的宿主容器
//依赖于 lstCss
function addCss(oTyping, n, callback) {
    if (n >= lstCss.length) { //递归结束
        if (typeof(callback) == "function") {
            callback();
        }
        return;
    }
    let bolIsAnnotation = false;
    let sTyping = "";
    let sSelector = "";
    let lstTemp = [];
    if (lstCss[n].indexOf("/*") > -1) { //存在 /* 则认为该行为注释
        bolIsAnnotation = true;
    } else {
        lstTemp = lstCss[n].split(/[={}]+/).filter(item => item != ''); //按 ={} 这3个符号切割
        sSelector = lstTemp[0]; //第一项为 selector
        //lstTemp = lstTemp.splice(1); //删除第一项 
        lstTemp = lstTemp[1].split(";").filter(item => item != ''); //按; 切割
        lstTemp.unshift(sSelector + " {\n"); //把 selector 添加回去
        lstTemp.push("}\n");
    }

    if (bolIsAnnotation) {
        let oSpan = $("<span></span>");
        oSpan.addClass("css-annotation");
        oTyping.append(oSpan);
        typing(oSpan, lstCss[n], 0, () => {
            addCss(oTyping, n + 1, callback); //递归调用
        });
    } else {
        let oMain = $(sSelector);
        addStyle(oMain, oTyping, lstTemp, 0, () => {
            addCss(oTyping, n + 1, callback); //递归调用
        });
    }
}

function addStyle(oMain, oTyping, lstStyle, n, callback) {
    if (n >= lstStyle.length) { //递归结束
        if (typeof(callback) == "function") {
            callback();
        }
        return;
    }
    let bolIsStyle = true;
    if (n == 0 || n == lstStyle.length - 1) { //认为首尾为style //lstStyle[n].indexOf(":") > -1
        bolIsStyle = false;
    }
    if (bolIsStyle) {
        let lstTemp = lstStyle[n].split(":").filter(item => item != '');

        let oSpanKey = $("<span class=\"css-key\"></span>");
        oTyping.append(oSpanKey);
        typing(oSpanKey, "    " + lstTemp[0] + ":", 0, () => {
            let oSpanValue = $("<span class=\"css-value\"></span>");
            oTyping.append(oSpanValue);
            typing(oSpanValue, lstTemp[1] + ";\n", 0, () => {
                oMain.css(lstTemp[0], lstTemp[1]);
                addStyle(oMain, oTyping, lstStyle, n + 1, callback); //递归调用
            });
        });
    } else {
        let oSpan = $("<span class=\"css-selector\"></span>");
        oTyping.append(oSpan);
        typing(oSpan, lstStyle[n], 0, () => {
            addStyle(oMain, oTyping, lstStyle, n + 1, callback); //递归调用
        });
    }
}