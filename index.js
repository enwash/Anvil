const {BrowserWindow, dialog} = require('electron').remote;
var w = BrowserWindow.getFocusedWindow();

q.get('#minimize').on('click',e=>w.minimize());
//q.get('#maximize').on('click',e=>{w.isMaximized()?w.restore():w.maximize()});
q.get('#close').on('click',e=>w.close());

q.forAll('.tabs>li',s=>{
  s.on('click',e=>{
    q.forAll('.tabs>li',n=>{
      n.delClass('selected');
    });
    var x = e.target;
    if (e.target.nodeName == 'A') { x = e.target.parentNode }
    x.addClass('selected');
    q.forAll('.cont',n=>{
      n.style.display = 'none';
    });
    q.get('#tab'+x.id).style.display = 'block';
  });
});

q.get('#models').click();

let modelLayers = {
  "block/cube_all": [
    "all"
  ],
  "block/orientable": [
    "top",
    "front",
    "side"
  ],
  "block/cube_column": [
    "end",
    "side"
  ],
  "block/template_torch": [
    "torch"
  ],
  "block/cross": [
    "cross"
  ],
  "block/crop": [
    "crop"
  ],
  "block/rail_flat": [
    "rail"
  ],
  "block/carpet": [
    "wool",
    "particle"
  ],
  "block/slab": [
    "bottom",
    "top",
    "side"
  ],
  "block/slab_top": [
    "bottom",
    "top",
    "side"
  ],
  "block/stairs": [
    "bottom",
    "top",
    "side"
  ],
  "block/inner_stairs": [
    "bottom",
    "top",
    "side"
  ],
  "block/outer_stairs": [
    "bottom",
    "top",
    "side"
  ],
  "block/fence_post": [
    "texture"
  ],
  "block/fence_side": [
    "texture"
  ],
  "block/template_trapdoor_bottom": [
    "texture"
  ],
  "block/template_trapdoor_top": [
    "texture"
  ],
  "block/template_trapdoor_open": [
    "texture"
  ],
  "item/generated": [
    "layer0"
  ],
  "block/{block}": []
}

let modelParent = "block/cube_all";
let mpBox = q.get('#modelParent');
let updateModelFields = e => {
  modelOptions.innerHTML = '';
  if (mpBox.value == "block/{block}") { // special case for block items
    c = `<div class="modopt"><label for="opt-itemparent">parent:&nbsp;</label> <input type="text" placeholder="modid:block/example" id="opt-itemparent"></div>`;
    modelOptions.innerHTML += c;
  }
  else {
    fields = modelLayers[mpBox.value];
    for (i = 0; i < fields.length; i++) {
      c = `<div class="modopt"><label for="opt-${fields[i]}">${fields[i]}:&nbsp;</label> <input type="text" placeholder="modid:${mpBox.value.substr(0, mpBox.value.indexOf('/'))}/example" id="opt-${fields[i]}"></div>`;
      modelOptions.innerHTML += c + '\n';
    }
  }
}

q.get('#generateModel').on('click',e => {
  let dat;
  let mainName = 'model';
  if (mpBox.value == "block/{block}") { // special case for block items
    dat = {"parent": q.get('#opt-itemparent').value};
    mainName = dat['parent'].substring(dat['parent'].indexOf('/')+1,dat['parent'].length)
  }
  else {
    dat = {"parent": mpBox.value,"textures":{}};
    for (i in modelLayers[mpBox.value]) {
      if (mainName == 'model') { mainName = q.get(`#opt-${modelLayers[mpBox.value][i]}`).value; }
      dat['textures'][modelLayers[mpBox.value][i]] = q.get(`#opt-${modelLayers[mpBox.value][i]}`).value;
    }
  }
  let wpath = dialog.showSaveDialogSync({'title':'Anvil - Save model','defaultPath':`${mainName}`,'filters':[{'name':'Minecraft Java model (.json)','extensions':['json']}]});
  require('fs').writeFileSync(wpath, JSON.stringify(dat,null,'\t')); // remove second two params if you don't want pretty printing. global options for this in the future
});

updateModelFields();
mpBox.on('change',updateModelFields);
