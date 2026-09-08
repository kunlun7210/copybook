export const fonts = [['HengShuiTi1.woff','舒窈衡水体'],['hwyHengShuiTi.woff','海无涯衡水体'],['SegoeUIItalic.woff','衡水体'],['xuminH.woff','xuminH手写体'],['HengShuiTi.woff','意大利体'],['Alibaba Sans.woff','阿里西文体'],['nxbbt.woff','南翔棒棒体'],['mgt.woff','木棍体']];
export const paperSizes=[['210,297','A4纵'],['297,210','A4横'],['297,420','A3纵'],['420,297','A3横'],['148,210','A5纵'],['210,148','A5横'],['182,257','B5纵'],['257,182','B5横'],['195,270','16K纵'],['270,195','16K横']];
export const splits=[['1,1','不分页'],['1,2','横1竖2'],['1,3','横1竖3'],['2,1','横2竖1'],['2,2','横2竖2'],['2,3','横2竖3'],['3,1','横3竖1'],['3,2','横3竖2']];
export const defaults:Record<string,string>={mobanfile:'danci',zttitle:'英语单词描写练习',words:'rule尺子\nname|neɪm|名字\nbook|/bʊk/|书本|I have a book.|我有一本书。\nhand|/hænd/|手',pagesize:'210,297',yzy:'1,1',showpageon:'0',cborder:'0',toolbc:'',papercx:'0',ppd:'15-15-17-15',yzyns:'0',yzynszx:'0',secondfont:'',gc:'#13b061',gsize:'12',bjtmd:'100',fsize:'100',titlestr:'',headcont:'',footcont:'',ybzc:'#000000',tc:'#cccccc',zckd:'350自动-自动',fgxxx:'solid',xtcx:'2-0.5',jxcolor:'#ff3d00',gzhjj:'60-30',ljj:'8',mzcs:'5',mh:'2',kh:'0',lizifill:'#ebfeed',cgjj:'12',fonttype:'HengShuiTi1.woff',sysfont:'',wzsxpy:'0',lspacing:'0',enfstyle:'',smwzwz:'xf',smwznoheight:'',khgd:'默认',excolor:'',enfweight:''};
export type Field={key:string,label:string,type?:'number'|'color'|'select'|'switch',help?:string,options?:string[][],more?:boolean,min?:number,max?:number};
export const fields:Field[]=[
{key:'ybzc',label:'样字颜色',type:'color'},{key:'tc',label:'描字颜色',type:'color'},
{key:'zckd',label:'字词宽度',help:'第1个值为左侧例字格宽，第2个值是右侧描词宽（10等于1mm）。第1个值后加自动表示例字格最小宽度。'},
{key:'fgxxx',label:'分隔线型',type:'select',options:[['0','不显示'],['solid','实线'],['on','虚线'],['dotted','点线'],['dashedsolid','上虚下实'],['dottedsolid','上点下实']],help:'四线三格中间两条线条类型。'},
{key:'xtcx',label:'线条粗细',help:'例：2-0.5，顶底两条线粗为2，中间两条线粗为0.5。'},{key:'jxcolor',label:'基线颜色',type:'color'},
{key:'gzhjj',label:'行间距',help:'10等于1毫米。减号后表示字块内行距，如60-30。可输入自动-8。'},{key:'ljj',label:'列间距',type:'number',min:0,max:100,help:'左侧例字与右侧格子的间距（像素）。'},{key:'mzcs',label:'描字次数',type:'number',min:0,max:200,help:'每行描词次数，显示不下时自动减少。'},
{key:'mh',label:'描字行数',type:'number',min:0,max:30,help:'每个单词的描字行数量。'},{key:'kh',label:'空行数量',type:'number',min:0,max:20,help:'每个单词后空白练习行数。'},{key:'lizifill',label:'样字背景',type:'color',help:'样字格子的背景，清空为透明。'},
{key:'cgjj',label:'词格列距',type:'number',min:0,max:100,help:'描词之间的间距（毫米）。'},{key:'fonttype',label:'英文字体',type:'select',options:fonts,help:'选择书写字体。'},{key:'sysfont',label:'系统字体',help:'输入本机已安装字体的完整名称，优先使用该字体。'},
{key:'wzsxpy',label:'文字偏移',more:true,help:'例：0,8；第1个值是上下偏移（正值向下），第2个值是格子左右内距。'},{key:'lspacing',label:'字间距',type:'number',min:-20,max:30,more:true},{key:'enfstyle',label:'使用斜体',type:'switch',more:true},
{key:'smwzwz',label:'汉字位置',type:'select',options:[['sf','格子上方'],['xf','格子下方']],help:'译文在单行格子上方或下方。多行单词的音标、译文位于样字下方。'},{key:'smwznoheight',label:'汉字高度',type:'switch',help:'打开后不占高度，请手动留足行间距。'},
{key:'khgd',label:'空段高度',more:true,help:'□插入的空段高度，单位毫米。默认等于一个格子高度。'},{key:'excolor',label:'二线颜色',type:'color',more:true,help:'四线格第二条线的颜色，清空则跟随格子颜色。'},{key:'enfweight',label:'使用粗体',type:'switch',more:true,help:'部分字体打印加粗效果可能不同。'}];
export type Addition={id:string,type:'text'|'image'|'grid'|'qr',text:string,x:number,y:number,width:number,height:number,size:number,color:string,page:string,src?:string,opacity:number,rotation:number,behind:boolean,grid?:string,locked?:boolean};
export type Copybook={config:Record<string,string>,moreText:Record<string,string>,additions:Addition[]};
export const initial:Copybook={config:defaults,moreText:{},additions:[]};
