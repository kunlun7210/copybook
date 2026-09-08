import { sxsg } from './engezi.js';
export function makezitie(mystr, func) {
    let currstr = mystr || gcstr;
    if(!currstr.gsize) currstr.gsize = 12;
    let gzhjj = currstr.gzhjj.split('-');
    currstr.gzhjj = gzhjj[0];
    let hglrnj = currstr.wzsxpy.split(/[,，]/);
	if(hglrnj[1] && !isNaN(hglrnj[1])) hglrnj = parseInt(hglrnj[1]);
	else hglrnj = 6;
    let znhjj = 0;
    if(gzhjj[1] && !isNaN(gzhjj[1])){
        znhjj = Dwzh.mm2px(gzhjj[1] / 10, 10);
    }
    let zckd = 'auto';  
    let minzckd = 130;  //最小例字宽度
    if(isNaN(currstr.zckd)){
        let mzckd = parseInt(currstr.zckd);
        if(mzckd) minzckd = Dwzh.mm2px(mzckd/10);
    }
    if(currstr.zckd.indexOf('-')){
        let kd = currstr.zckd.split("-");
        if(!isNaN(kd[0])) zckd = Dwzh.mm2px(kd[0]/10);
        if(!isNaN(kd[1])) currstr.zckd = kd[1];
        else currstr.zckd = '自动';
    }
    let lzgljj = parseFloat(currstr.ljj);
    currstr.ljj = 0;
    var gc = new Zitie(currstr);
    sxsg(gc);
    if((gc.mh+gc.kh)<2){
        if(!gc.okwords.moreText) gc.okwords.moreText = {};
        if(!gc.okwords.moreText["moretext-1"]) gc.okwords.moreText["moretext-1"] = "font-size: 18px;justify-content: center;display: inline-flex;";
    }
    gc.hglrnj = hglrnj;
    gc.znhjj=0;
    let spacing = gc.lspacing ? 'letter-spacing:' + gc.lspacing + 'px;' : '';
    let cgjj = Dwzh.mm2px(gc.cgjj);
    gc.zckd = isNaN(gc.zckd) ? 0 : Dwzh.mm2px(gc.zckd/10);
    if(!gc.cgjj || gc.zckd) gc.cgjj = 0;
    else gc.cgjj = cgjj
    var ens = gc.okwords.cds.split("\n");
    let lzbjys = gc.lizifill||'';
    
    let mt1 = gc.getTextStyle('1',`font-size:16px;`);
    let mt2 = gc.getTextStyle('2',`font-size:16px;`);
    let mt3 = gc.getTextStyle('3',`font-size:16px;`);
    gc.setFont(function () {
        let hjjhtml = znhjj>0 ? `<div style="height:${znhjj}px;clear: both;"></div>` : '';
        let ishtml = '<div style="width:' + (gc.contw - gc.hglrnj * 2) + 'px;font-size:' + gc.enfsize + 'px;line-height: 1;' + spacing + '">';
        let khobj = gc.sxsg();
        let obj = $('#temp_cont');
        let cihtml = `<div style="display: inline-block;position: relative;top:${gc.enptop}px;${spacing}color:${gc.tc};white-space: nowrap;`;
        let cihtmllz = `<div style="position: relative;top:${gc.enptop}px;${spacing}color:${gc.ybzc};white-space: nowrap;text-align: center;">`;
        for (let i = 0; i < ens.length; i++) {
            if(ens[i][0]==='□'){gc.crkd(ens[i]);continue;}
            if(ens[i]==='@@'){gc.insertPage();continue;}
            if(!ens[i] || ens[i] == '\n'){gc.addhtml(khobj);continue;}
            let ei = ens[i].split('|');
            if(typeof ei[1]=="undefined"){
                let zwwz = ens[i].search(/[\u4E00-\u9FFF\u3400-\u4DBF　（《〖【『「〈]/);
                if(zwwz>0){
                    ei[0] = ens[i].substr(0,zwwz);
                    ei[1] = ens[i].substr(zwwz).replace('　','');
                }else{
                    ei[1] = '';
                }
            }
            if (typeof ei[1] != 'string') ei[1] = '';
            if (typeof ei[2] != 'string') ei[2] = '';
            if(ei[0][0]==='\\'){
                //如果英文首字母是\，表示直接生成普通整行英文格
                let lizieng = gc.sxsg(`<div style="position: relative;top:${gc.enptop}px;${spacing}color:${gc.ybzc};white-space: nowrap;">${ei[0].substr(1)}</div>`, ei[1]||ei[2]||'');
                if(gc.mh>0){
                    let mzh = gc.sxsg(`<div style="position: relative;top:${gc.enptop}px;${spacing}color:${gc.tc};white-space: nowrap;">${ei[0].substr(1)}</div>`);
                    for (let n = 0; n < gc.mh; n++) { 
                        lizieng.html += hjjhtml + mzh.html;
                        lizieng.h += znhjj + mzh.h;
                    }
                }
                if(gc.kh>0){
                    for (let n = 0; n < gc.kh; n++) { 
                        lizieng.html += hjjhtml + khobj.html;
                        lizieng.h += znhjj + khobj.h;
                    }
                }
                gc.addhtml({html:`<div style="width:${gc.contw}px;margin: 0 auto;">${lizieng.html}</div>`,h:lizieng.h});
                continue;
            }
            obj.html(ishtml + cihtml + '"><span id="cikd">' + ei[0] + '</span></div></div>');
            let dcwd = obj.find('#cikd').width();
            let lzwd=160; //例字宽度
            if(zckd!='auto'){
                lzwd = zckd+gc.hglrnj*2;
            }else{
                lzwd = dcwd+gc.hglrnj*2 < minzckd ? minzckd : dcwd+gc.hglrnj*2;
            }
            let rgzw = gc.contw - lzwd - lzgljj;
            
            let hanghtml = '',sykd = rgzw-gc.hglrnj*2;
            for (let n = 0; n < gc.mzcs; n++) {
                let sk = '';
                let dcw = dcwd;
                if(n>0){
                    let ml = cgjj;
                    if(gc.zckd && gc.zckd-dcwd>cgjj){
                        ml = gc.zckd-dcwd;
                    }
                    dcw += ml;
                    sk += `margin-left:${ml}px;`;
                }
                if(sykd>=dcw){
                    hanghtml += cihtml+`margin-left:${dcw-dcwd}px;">${ei[0]}</div>`;
                    sykd-=dcw;
                }
            }
            let dhgz = {html:'',h:0};
            if((gc.mh+gc.kh)<2){
                //右侧如果只有一行
                let mzh = gc.sxsg(hanghtml, ei[2]||'', { width: rgzw, moretext:'2' });
                let lizieng = gc.sxsg(cihtmllz + ei[0] + '</div>', ei[1], { width: lzwd-1,fill: lzbjys, moretext:'1'});
                dhgz.html = `<div class="borderbox" style="margin-right: ${lzgljj}px;">${lizieng.html}</div><div class="borderbox" style="vertical-align: top;">${mzh.html}</div>`;
                dhgz.h = lizieng.h>mzh.h ? lizieng.h : mzh.h;
            }else{
                if(ei[0]){
                    let mzh = gc.sxsg(hanghtml, '', { width: rgzw });
                    for (let n = 0; n < gc.mh; n++) {
                        if(dhgz.h>0){
                            dhgz.html += hjjhtml;
                            dhgz.h+=znhjj;
                        }
                        dhgz.html += mzh.html;
                        dhgz.h += mzh.h;
                    }
                    let kgh = gc.sxsg(' ', '', { width: rgzw });
                    for (let n = 0; n < gc.kh; n++) {
                        if(dhgz.h>0){
                            dhgz.html += hjjhtml;
                            dhgz.h+=znhjj;
                        }
                        dhgz.html += kgh.html;
                        dhgz.h += kgh.h;
                    }
                }
                let lizieng = gc.sxsg(cihtmllz + ei[0] + '</div>', '', { width: lzwd-1,fill: lzbjys,stylestr:'margin:0 -1px -1px 0;'});
                if(mt3.indexOf('border-width:')!=-1){
                    lizieng.html = `<div style="margin-top:-1px;">${lizieng.html}</div>`;
                    lizieng.h -= 1;
                }
                if(ei[1]!=='') ei[1] = `<div class="kaiti moretext-1" style="${mt1}">${ei[1]}</div>`;
                if(ei[2]!=='') ei[2] = `<div class="kaiti moretext-2" style="${mt2}">${ei[2]}</div>`;
                let lizibox = !ei[0] ? '' : `<div class="borderbox" style="margin-right: ${lzgljj}px;">
                <div class="bc moretext-3" style="width:${lzwd}px;text-align:center;height: ${dhgz.h}px;overflow: hidden;${mt3}">
                ${lizieng.html}
                <div style="display:inline-flex;flex-direction: column;align-items: center;justify-content: space-around;line-height:1.1;width:${lzwd-10}px;height:${dhgz.h-lizieng.h}px;">
                ${ei[1]}
                ${ei[2]}
                </div>
                </div></div>`;
                dhgz.html = lizibox + '<div class="borderbox" style="vertical-align: top;">' + dhgz.html  + '</div>';
                
            }
            for(let s=3;s<ei.length; s+=2){
                if (typeof ei[s+1] == 'undefined') ei[s+1] = '';
                else if (ei[s+1] === ' ') ei[s+1] = '&nbsp;';
                let ljobj = gc.sxsg(cihtml +'">'+ ei[s] + '</div>', ei[s+1]);
                dhgz.html += hjjhtml+ljobj.html;
                dhgz.h += znhjj + ljobj.h;
            }
            gc.addhtml({html:`<div style="width:${gc.contw}px;margin: 0 auto;">${dhgz.html}</div>`,h:dhgz.h});
        }
        if (typeof func == "function") {
            func(gc);
            return;
        }
        gc.show();
        if (gc.gc == '#ffffff' && gc.cborder[0] > 0) $('.cont').children().css('border-color', gc.jxcolor);
    });
}