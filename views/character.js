$(document).ready(function() {
  if (!player)
    return;

  //make mod dynamic
  var li = ['str', 'dex', 'con', 'wis', 'int', 'cha'];
  if (!reload) { //load protoplayer
    for (var stat of li) {
      var code = '$("#' + stat + '").on("input", function() {' +
        'player.stats["' + stat + '"].value = $("#' + stat + '").html();' +
        '$("#' + stat + '_mod").html(player.stats["' + stat + '"].mod());' +
      '});';
      eval(code);

      code = '$("#' + stat + '").html(player.stats["' + stat + '"].value);';
      eval(code);
      updateMod(stat);
    }

    $('#name').html(player.username);
    $('#hp').html(player.hp + '/' + player.hp);
    $('#ac').html(player.ac);
    $('#gold').html(player.gp);
    $('#equipment').html(makeEquipment(player.equipment));
    $('#inventory').html(makeLines(player.background.equipment));
    $('#proficiencies').html(makeLines([makeLines([player.background.feature]), makeLines(player.race.languages), makeLines(player.background.languages), makeLines(niceify(player.class.proficiencies.weapons)), makeLines(niceify(player.class.proficiencies.armor)), makeLines(player.race.abilities), makeLines(niceify(player.class.tools)), makeLines(player.background.tools)]));
    $('#background').html(makeLines([player.background.type, player.alignment.type]));
    $('#spells').html(makeLines(player.class.abilities) + '<br>' +
      'Spells: ' + player.class.spells + '<br>' +
      'Spell slots: ' + player.class.spell_slots + '<br>' +
      'Cantrips: ' + player.class.cantrips + '<br>'
    );




  } else { //load Player
    $('name').on('input', function() {player.username = $('name').html()});
    $('hp').on('input', function() {player.hp = $('hp').html()});
    $('ac').on('input', function() {player.ac = $('ac').html()});
    $('name').on('input', function() {player.username = $('name').html()});
  }

});

function makeEquipment(li) {
  var equip = [];
  for (var i of li) {
    var temp;
    if (i.damage) { //is weapon
      temp = '<i>' + i.type + '</i> - ' + i.damage.type + '<br>' +
        '&nbsp; &nbsp; ' + i.damage_type + '<br>' +
        '&nbsp; &nbsp; ' + i.properties;
    }
    else if (i.base_ac) {
      temp = '<i>' + i.type + '</i> - ' + i.base_ac + '<br>' +
        '&nbsp; &nbsp; ' + i.size;
    }
    else {
      temp = '<i>' + i.type + '</i> - +' + i.ac_mod + ' AC';
    }
    equip.push(temp);
  }
  return makeLines(equip);
}

function makeLines(li) {
  var str = '';
  for (let i of li)
    str += i + '<br>';
  return str;
}

function niceify(item) {
  var niced = [];
  if (item == ['None'])
    return niced;
  for (var i of item) {
    if (i == 'simple')
      niced.push('Simple Weapons');
    else if (i == 'martial')
      niced.push('Martial Weapons');
    else if (i == 'light')
      niced.push('Light Armor');
    else if (i == 'medium')
      niced.push('Medium Armor');
    else if (i == 'heavy')
      niced.push('Heavy Armor');
    else if (i == 'shields')
      niced.push('Shields');
  }
  return niced;
}

function updateMod(stat) {
  player.stats[stat].value = $('#' + stat).html();
  $('#' + stat + '_mod').html(player.stats[stat].mod());
}

function Player() {
  this.str;
  this.dex;
  this.con;
  this.wis;
  this.int;
  this.cha;
  this.name;
  this.hp;
  this.ac;
  this.pro;
  this.gold;
  this.equipment;
  this.inventory;
  this.skills;
  this.proficiencies;
  this.background;
  this.spells;
}

function protoPlayer() {
  this.alignment;
  this.background;
  this.class;
  this.race;
  this.stats;
  this.username = 'Adventurer';
  this.hp = 0;
  this.proficiency = 2;
  this.level = 1;
  this.skills;
  this.gp = 0;
  this.equipment = [];
  this.ac = 0;
  this.proficiencies = [];
}

var player = new protoPlayer();
var reload;

function Stat(type, short, value) {
  this.type = type;
  this.short = short;
  this.value = value;
  this.mod = function() {
    return Math.floor((this.value - 10) / 2);
  }
}

var str = new Stat("Strength", 'str', 0);
var dex = new Stat("Dexterity", 'dex', 0);
var con = new Stat("Constitution", 'con', 0);
var wis = new Stat("Wisdom", 'wis', 0);
var int = new Stat("Intelligence", 'int', 0);
var cha = new Stat("Charisma", 'cha', 0);
var stats = [str, dex, con, wis, int, cha];
player.stats = {
  'str': str,
  'dex': dex,
  'con': con,
  'wis': wis,
  'int': int,
  'cha': cha
};;

if (localStorage.getItem('player')) {
  player = JSON.parse(localStorage.getItem('player'));
  reload = JSON.parse(localStorage.getItem('reload'));
  if (!reload) {
    for (var stat of ['str', 'dex', 'con', 'wis', 'int', 'cha']) {
      player.stats[stat].mod = function() {
        return Math.floor((this.value - 10) / 2);
      }
    }
  }
}
