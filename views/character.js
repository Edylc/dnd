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
    $('#equipment').html('');
    $('#inventory').html(/*separate lines of shit*/);
    $('#proficiencies').html()
    $('#background').html()
    $('#spells').html()




  } else { //load Player
    $('name').on('input', function() {player.username = $('name').html()});
    $('hp').on('input', function() {player.hp = $('hp').html()});
    $('ac').on('input', function() {player.ac = $('ac').html()});
    $('name').on('input', function() {player.username = $('name').html()});
  }

});

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
