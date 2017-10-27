$(document).ready(function() {
  if (!player)
    return;

  $('#get').click(function() {
    $('#text').html(btoa(JSON.stringify(player)));
  });

  $('#load').click(function() {
    player = JSON.parse(atob($('#text')[0].value));
    localStorage.setItem('player', JSON.stringify(player));
    localStorage.setItem('reload', JSON.stringify(true));
    location.reload();
  });

  $('#new').click(function() {
    window.location = 'http://dunder.herokuapp.com/creation';
  });

  $('#save').click(function() {
    alert('Saved!');
    localStorage.setItem('player', JSON.stringify(player));
  });

  var li = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  var temp;
  if (!reload) { //load protoplayer
    alert('There are a couple things you will need to do in Background.');
    for (var stat of li)
      $('#' + stat).html(player.stats[stat].value);

    $('#name').html(player.username + ' - ' + player.race.type + ' ' + player.class.type + ' ' + player.level);
    $('#hp').html(player.hp + '/' + player.hp);
    $('#ac').html(player.ac);
    $('#proficiency').html(player.proficiency);
    $('#gold').html(player.gp);
    $('#equipment').html(makeEquipment(player.equipment));
    $('#inventory').html(makeLines(player.background.equipment));
    $('#proficiencies').html(makeLines([makeLines([player.background.feature]), makeLines(player.race.languages), makeLines(player.background.languages), makeLines(niceify(player.class.proficiencies.weapons)), makeLines(niceify(player.class.proficiencies.armor)), makeLines(player.race.abilities.concat([player.race.size])), makeLines(niceify(player.class.tools)), makeLines(player.background.tools)]));
    $('#background').html(makeLines([player.background.type, player.alignment.type, reminders()]));
    $('#spells').html(makeLines(player.class.abilities) + '<br>' +
      'Spells: ' + player.class.spells + '<br>' +
      'Spell slots: ' + player.class.spell_slots + '<br>' +
      'Cantrips:  ' + player.class.cantrips + '<br>'
    );
    for (var prof of player.background.skills) {
      $('#' + getSkill(prof).short + '_row').addClass('selected');
    }
    temp = player.background.skills;

  } else { //load Player
    var all = li.concat(['name', 'hp', 'ac', 'proficiency', 'gold', 'equipment', 'inventory', 'proficiencies', 'background', 'spells']);
    for (var stat of all) {
      $('#' + stat).html(player[stat]);
    }
    for (var prof of player.skills) {
      $('#' + getSkill(prof).short + '_row').addClass('selected');
    }
    temp = player.skills;
  }

  for (var stat of li)
    updateMod(stat);
  updateSkills();

  player = new Player();
  var all = li.concat(['name', 'hp', 'ac', 'proficiency', 'gold', 'equipment', 'inventory', 'proficiencies', 'background', 'spells']);
  for (var stat of all) {
    player[stat] = $('#' + stat).html();
  }

  player.skills = temp;
  localStorage.setItem('player', JSON.stringify(player));
  localStorage.setItem('reload', JSON.stringify(true));

  function setStat(stat) {
    $('#' + stat).on('input', function() {
      player[stat] = $('#' + stat).html();
    });
  }
  for (var stat of all) {
    setStat(stat)
  }
  function setStatAdvanced(stat) {
    $('#' + stat).on('input', function() {
      player[stat] = $('#' + stat).html();
      $('#' + stat + '_mod').html(Math.floor((parseInter($('#' + stat).html()) - 10) / 2));
      updateSkills();
    });
  }
  for (var stat of li) {
    setStatAdvanced(stat)
  }

  $('#proficiency').on('input', function() {
    player.proficiency = $('#proficiency').html();
    updateSkills();
  });
  $('.skill').click(function() {
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
      var skill = this.id.substring(0, this.id.indexOf('_row'));
      updateSkill(skill);
      console.log(getSkill(skill).type);
      player.skills.splice(player.skills.indexOf(getSkill(skill).type), 1);
    }
    else {
      $(this).addClass('selected');
      var skill = this.id.substring(0, this.id.indexOf('_row'));
      updateSkill(skill);
      player.skills.push(getSkill(skill).type);
    }
  })

  $('#roll').click(function() {
    var input = prompt('Roll:');
    var d = input.indexOf('d');
    var number = parseInter(input.substring(0, d));
    var die = parseInter(input.substring(d + 1));

    if (!isNaN(input)) {
      if (navigator.onLine && [4, 6, 8, 10, 20].includes(die)) {
        $('#i').attr('src', 'http://a.teall.info/dice/?notation=' + 'd' + input + '&roll');
        var start = (new Date()).getTime()
        $('#i').on('load', function() {
          $('#i_holder').fadeIn(300);
        })
        return;
      }
      var roll = Math.floor(Math.random() * parseInter(input) + 1);
      alert('Rolled ' + roll);
      return;
    }

    if (die == 0 || (number == 0 && input.substring(0, d) != '')) {
      alert('Crit fail! You entered an incorrect format.');
    } else {
      if (navigator.onLine && [4, 6, 8, 10, 20].includes(die)) {
        $('#i').attr('src', 'http://a.teall.info/dice/?notation=' + input + '&roll');
        $('#i').on('load', function() {
          $('#i_holder').fadeIn(300);
        })
        return;
      }
      if (number == 0)
        number = 1;
      var roll = Math.floor(Math.random() * die + 1) * number;
      alert('Rolled ' + roll);
    }
  });

  $('#i_close').click(function() {
    $('#i_holder').hide();
  })
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
      temp = '<i>' + i.type + '</i> - ' + i.base_ac + 'AC<br>' +
        '&nbsp; &nbsp; ' + i.size;
    }
    else {
      temp = '<i>' + i.type + '</i> - +' + i.ac_mod + ' AC';
    }
    equip.push(temp);
  }
  return makeLines(equip);
}

function reminders() {
  var remind = '<br>';
  remind += 'REMINDERS:<br>';
  var name = 'Give your adventurer a name!<br>';
  remind += name;

  var stat_mods = player.race.stats;
  var num_skills = player.class.num_skills;
  var skill_choices = player.class.skills;
  var constitution = 'Changing constitution will NOT automatically change your HP!<br>'
  var ac = 'Change your AC based on equipment and dexterity.<br>';
  var languages = 'Replace "Choice Language" with your choice.<br>';
  var style = 'Pick a style for your class, if at the right level.<br>';
  var background = 'Write yourself a background story!<br>';
  var further_info = '<br>Visit 5etools for more detailed DnD information.';

  remind += 'Racial stat modifiers:<br>';
  for (var i in stat_mods) {
    if (isNaN(stat_mods[i]))
      remind += '-' + stat_mods[i] + '<br>';
    else if (stat_mods[i] != 0)
      remind += '+' + stat_mods[i] + ' ' + ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'][i] + '<br>';
  }
  remind += 'Choose ' + num_skills + ' of:<br>';
  for (var skill of skill_choices)
    remind += '-' + skill.type + '<br>';
  remind += constitution + ac + languages + style + background + further_info;
  return remind;
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
  $('#' + stat + '_mod').html(Math.floor((parseInter($('#' + stat).html()) - 10) / 2));
}

function updateSkill(skill) {
  if ($('#' + skill + '_row').hasClass('selected')) {
    $('#' + skill).html(String(parseInter(player.proficiency) + parseInter($('#' + getSkill(skill).stat + '_mod').html())));
  } else {
    $('#' + skill).html($('#' + getSkill(skill).stat + '_mod').html());
  }
}

function updateSkills() {
  for (var skill of skills) {
    updateSkill(skill.short);
  }
}

function Player() {
  this.str;
  this.dex;
  this.con;
  this.int;
  this.wis;
  this.cha;
  this.name;
  this.hp;
  this.ac;
  this.proficiency;
  this.gold;
  this.equipment;
  this.inventory;
  this.skills = [];
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
var int = new Stat("Intelligence", 'int', 0);
var wis = new Stat("Wisdom", 'wis', 0);
var cha = new Stat("Charisma", 'cha', 0);
var stats = [str, dex, con, int, wis, cha];
player.stats = {
  'str': str,
  'dex': dex,
  'con': con,
  'int': int,
  'wis': wis,
  'cha': cha
};

function Skill(type, short, stat) {
  this.type = type;
  this.stat = stat;
  this.short = short;
  this.proficiency = 0;
}

var athletics = new Skill('Athletics', 'athletics', 'str');
var acrobatics = new Skill('Acrobatics', 'acrobatics', 'dex');
var sleight = new Skill('Sleight of Hand', 'sleight', 'dex');
var stealth = new Skill('Stealth', 'stealth', 'dex');
var arcana = new Skill('Arcana', 'arcana', 'int');
var hist = new Skill('History', 'hist', 'int');
var investigation = new Skill('Investigation', 'investigation', 'int');
var nature = new Skill('Nature', 'nature', 'int');
var religion = new Skill('Religion', 'religion', 'int');
var animal = new Skill('Animal Handling', 'animal', 'wis');
var insight = new Skill('Insight', 'insight', 'wis');
var medicine = new Skill('Medicine', 'medicine', 'wis');
var perception = new Skill('Perception', 'perception', 'wis');
var survival = new Skill('Survival', 'survival', 'wis');
var deception = new Skill('Deception', 'deception', 'cha');
var intimidation = new Skill('Intimidation', 'intimidation', 'cha');
var perform = new Skill('Performance', 'perform', 'cha');
var persuasion = new Skill('Persuasion', 'persuasion', 'cha');
var skills = [athletics, acrobatics, sleight, stealth, arcana, hist, investigation, nature, religion, animal, insight, medicine, perception, survival, deception, intimidation, perform, persuasion];

function getSkill(str) {
  for (var skill of skills) {
    if (str == skill.type || str == skill.short)
      return skill;
  }
}

if (localStorage.getItem('player')) {
  player = JSON.parse(localStorage.getItem('player'));
  reload = JSON.parse(localStorage.getItem('reload'));
}

function parseInter(str) {
  if (isNaN(str) || str == '')
    return 0
  return parseInt(str);
}
