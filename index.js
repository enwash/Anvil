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

q.get('#doPowered').on('change',e=>{
  q.get('#blockstatePowered').innerHTML = q.get('#doPowered').checked ? '<label for="blockstateModelOn">Model (powered):&nbsp;</label> <input type="text" placeholder="modid:block/example_on" id="blockstateModelOn">' : '';
});

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

q.get('#generateBlockstate').on('click',e => {
  let dat = {"variants":{}};
  if (q.get('#doPowered').checked) {
    if (q.get('#doFacing').checked) {
      dat['variants']['powered=true,facing=north'] = { 'model': q.get('#blockstateModelOn').value };
      dat['variants']['powered=true,facing=south'] = { 'model': q.get('#blockstateModelOn').value, 'y': 180 };
      dat['variants']['powered=true,facing=west'] = { 'model': q.get('#blockstateModelOn').value, 'y': 270 };
      dat['variants']['powered=true,facing=east'] = { 'model': q.get('#blockstateModelOn').value, 'y': 90 };

      dat['variants']['powered=false,facing=north'] = { 'model': q.get('#blockstateModel').value };
      dat['variants']['powered=false,facing=south'] = { 'model': q.get('#blockstateModel').value, 'y': 180 };
      dat['variants']['powered=false,facing=west'] = { 'model': q.get('#blockstateModel').value, 'y': 270 };
      dat['variants']['powered=false,facing=east'] = { 'model': q.get('#blockstateModel').value, 'y': 90 };
    }
    else {
      dat['variants']['powered=true'] = { 'model': q.get('#blockstateModelOn').value };
      dat['variants']['powered=false'] = { 'model': q.get('#blockstateModel').value };
    }
  }
  else {
    if (q.get('#doFacing').checked) {
      dat['variants']['facing=north'] = { 'model': q.get('#blockstateModel').value };
      dat['variants']['facing=south'] = { 'model': q.get('#blockstateModel').value, 'y': 180 };
      dat['variants']['facing=west'] = { 'model': q.get('#blockstateModel').value, 'y': 270 };
      dat['variants']['facing=east'] = { 'model': q.get('#blockstateModel').value, 'y': 90 };
    }
    else {
      dat['variants'][''] = { 'model': q.get('#blockstateModel').value };
    }
  }
  let mainName = q.get('#blockstateModel').value.substring(q.get('#blockstateModel').value.indexOf('/')+1,q.get('#blockstateModel').value.length)
  let wpath = dialog.showSaveDialogSync({'title':'Anvil - Save blockstate','defaultPath':`${mainName}`,'filters':[{'name':'Minecraft Java blockstate (.json)','extensions':['json']}]});
  require('fs').writeFileSync(wpath, JSON.stringify(dat,null,'\t')); // remove second two params if you don't want pretty printing. global options for this in the future
});

let rTypes = {
  'minecraft:crafting_shaped': {
    'btn': 'Add item key',
    'type': 'key' // key/value
  },
  'minecraft:crafting_shapeless': {
    'btn': 'Add ingredient',
    'type': 'lst' // ingredient list
  },
  'minecraft:smelting': {
    'btn': false,
    'type': 'sng' // single ingredient
  }
}

q.forAll('#shapedLayout input',x=>{
  x.on('click',e=>e.target.select());
  x.on('keyup',e=>e.target.value=e.target.value.toLowerCase())
})

let recipeChange = e=>{
  q.get('#recipeOpts').innerHTML='';
  btn=rTypes[q.get('#recipeType').value]['btn'];
  if (btn != false) {
    q.get('#recipeAddMulti').innerHTML = btn;
      q.get('#recipeAddMulti').classList.remove('hideme');
  }
  else {
    q.get('#recipeAddMulti').classList.add('hideme');
  }
  q.get('#recipeOpts').innerHTML += '<div><label for="recipeResult">Result:&nbsp;</label><input type="number" value="1" min="1" placeholder="1" id="recipeResultCount"><input type="text" placeholder="modid:example_item" id="recipeResult"></div>';
  if (rTypes[q.get('#recipeType').value]['type'] == 'key') {
    q.get('#shapedLayout').classList.remove('hideme');
    q.get('#recipeOpts').innerHTML+="<h2>Key</h2>";
  }
  else {
    q.get('#shapedLayout').classList.add('hideme');
  }
}

q.get('#recipeType').on('change',recipeChange);
recipeChange();

q.get('#recipeAddMulti').on('click',e=>{
  if (rTypes[q.get('#recipeType').value]['type'] == 'key') {
    
  }
})

updateModelFields();
mpBox.on('change',updateModelFields);
