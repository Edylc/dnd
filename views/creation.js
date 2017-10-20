//Gold amounts are probably fucky if you move back and forth a lot (i.e. it's set on equipSelect, won't change if you change class/background afterwards)
//implement rolling, skill selection, reloading past character
var url = 'http://dunder.herokuapp.com';

$(document).ready(function() {
  var state = race_select
  $('#instruction').html('Choose a Race');
  $('.options').html(makeButtons(races));
  $(document).on('click', '.button', function() {
    if ($(this).attr('id') == 'next_button')
      state = page(state.next);
    else if ($(this).attr('id') == 'prev_button')
      state = page(state.prev);
    else {
      assignToPlayer($(this).html())
      changeDisplay($(this).html());
    }
  });
  $('.roll').click(function() {
    var temp = this.id;
    for (var i of stats) {
      if (temp.includes(i.short)) {
        var rolls = [];
        var total = 0;
        for (var count = 0; count < 4; count++) {
          var roll = Math.ceil(Math.random() * 6);
          rolls.push(roll);
          total += roll;
        }
        total -= minimum(rolls);
        $('#' + i.short + ' > .roll_one').html(rolls[0]);
        setTimeout(function() {
          $('#' + i.short + ' > .roll_two').html(rolls[1]);
          setTimeout(function() {
            $('#' + i.short + ' > .roll_three').html(rolls[2]);
            setTimeout(function() {
              $('#' + i.short + ' > .roll_four').html(rolls[3]);
              setTimeout(function() {
                $('#' + i.short + ' > .total').html('<b>'+total+'</b>');
              }, 100);
            }, 100);
          }, 100);
        }, 100);
        $(this).attr('class', '');
        $(this).off('click');
        player.stats[i.short].value = total;
        console.log(player);
        return;
      }
    }
  });
});

function minimum(list) {
  var min = list[0];
  for (var i of list) {
    if (i < min)
      min = i
  }
  return min;
}

// DISPLAY OPTIONS

function assignToPlayer(aspect) {
  toAssign = getInfo(aspect)
  if (toAssign instanceof Race)
    player.race = toAssign;
  else if (toAssign instanceof Class)
    player.class = toAssign;
  else if (toAssign instanceof Background)
    player.background = toAssign;
  else if (toAssign instanceof Alignment)
    player.alignment = toAssign;
  // else if (toAssign instanceof Equipment)
  //   player.equipment = toAssign;
  else
    console.log('Bad assignment');
  console.log(player);
}

function page(target) {
  if (!target) {
    for (var status of statuses) {
      if (!player[status.type]) {
        alert(status.instruction);
        return statuses[statuses.length - 1];
      }
    }
    storePlayer();
    window.location = url + '/?player=true';
    console.log('switching pages');
    //return 'done';
  }

  $('#instruction').fadeOut(200);
  $('.options').fadeOut(200);
  $('.details').fadeOut(200);
  $('.equipment_picker').fadeOut(200);
  $('.stat_roller').fadeOut(200);
  $('#next_button').html('Next >');

  if (target.type == 'equipment') {
    displayEquipment();
    setTimeout(function() {
      $('.stat_roller').fadeOut(200);
      $('#instruction').html(target.instruction);
      $('.equipment_picker').fadeIn(200);
      $('#instruction').fadeIn(200);
    }, 200);
    return target;
  }
  if (target.type == 'rolling') {
    setTimeout(function() {
      $('.equipment_picker').fadeOut(200);
      $('#instruction').html(target.instruction);
      $('.stat_roller').fadeIn(200);
      $('#instruction').fadeIn(200);
      $('#next_button').html('Finish >');
    }, 200);
    return target;
  }
  setTimeout(function() {
    $('#instruction').html(target.instruction);
    $('.options').html(makeButtons(target.options));
  }, 200);

  $('#instruction').fadeIn(200);
  $('.options').fadeIn(200);
  $('#prev_button').fadeIn();
  $('#next_button').fadeIn();
  if (target.type == 'race')
    $('#prev_button').fadeOut(200);
  return target;
}

function storePlayer() {
  var health = player.class.hit_die.die + player.stats.con.mod();
  player.hp = health;
  localStorage.setItem('player', JSON.stringify(player));
  localStorage.setItem('reload', JSON.stringify(false));
}

var equips_shown = false;
function displayEquipment() {
  if (equips_shown)
    return;
  setGold();
  for (var equip of weapons) {
    if (!equip.martial && !equip.ranged)
      $('.simple.melee.weapon').append(equip.display);
    else if (!equip.martial && equip.ranged)
      $('.simple.ranged.weapon').append(equip.display);
    else if (equip.martial && !equip.ranged)
      $('.martial.melee.weapon').append(equip.display);
    else if (equip.martial && equip.ranged)
      $('.martial.ranged.weapon').append(equip.display);
  }
  for (var equip of armor) {
    if (equip.size == 'Light')
      $('.light.armor').append(equip.display);
    else if (equip.size == 'Medium')
      $('.medium.armor').append(equip.display);
    else if (equip.size == 'Heavy')
      $('.heavy.armor').append(equip.display);
  }
  for (var equip of shields) {
    $('.shields').append(equip.display);
  }
  equips_shown = true;
}

function setGold() {
  if (player.background) {
    player.gp += player.background.gold;
  }
  if (player.class) {
    player.gp += player.class.start_gold.roll();
  }
  $('.gold').html(player.gp);
}

function equip(elem) {
  var item = getInfo($(elem).attr('id'));
  if ($(elem).hasClass('clicked')) {
    $(elem).removeClass('clicked');
    player.gp += item.cost;
    player.equipment.pop(item);
  } else {
    $(elem).addClass('clicked');
    player.gp -= item.cost;
    player.equipment.push(item);
  }
  player.gp = +player.gp.toFixed(1);
  $('.gold').html(player.gp);
}

function changeDisplay(button) {
  var info = getInfo(button)
  display(info);
}

function makeButtons(li) {
  var ans = '';
  for (var i of li) {
    ans += '<div class="button">' + i.type + '</div>';
  }
  return ans;
}

function getInfo(item) {
  for (var i of races.concat(classes).concat(backgrounds).concat(alignments).concat(equipment)) {
    if (i.type == item)
      return i
  }
}

function display(selection) {
  $('.details').fadeOut(200);
  $('#desc_header').html(selection.type);
  $('#description').html(selection.display);
  $('.details').fadeIn(200);
}

function list(li) {
  var ans = '';
  for (var i of li) {
    if (i.type)
      ans += i.type + ', ';
    else
      ans += i + ', ';
  }
  return ans.substring(0, ans.length - 2)
}

function Status(type, instruction, options, prev) {
  this.type = type;
  this.instruction = instruction;
  this.options = options;
  this.prev = prev;
  if (this.prev != null)
    this.prev.next = this;
  this.next = null;
}

var race_select, class_select, background_select, alignment_select, equipment_select, rolling;

// GAMEPLAY ABSTRACTIONS

function Player() {
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

var player = new Player();

function Roll(die, times, add = 0, mul = 1) {
  this.die = die
  this.times = times;
  this.add = add;
  this.mul = mul;
  this.type = times + 'd' + die;
  if (add != 0)
    this.type += ' + ' + add;
  if (mul != 1)
    this.type += ' x ' + mul;
  this.roll = function() {
    var total = 0;
    for (var i = 0; i < times; i++) {
      total += Math.floor(Math.random() * die + 1);
    }
    total *= mul;
    total += add;
    return total;
  }
}

function Stat(type, short, value) {
  this.type = type;
  this.short = short;
  this.value = value;
  this.mod = function() {
    return Math.floor((this.value - 10) / 2)
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

function Skill(type, stat) {
  this.type = type;
  this.stat = stat;
  this.proficiency = 0;
}

var athletics = new Skill('Athletics', 'Strength');
var acrobatics = new Skill('Acrobatics', 'Dexterity');
var sleight = new Skill('Sleight of Hand', 'Dexterity');
var stealth = new Skill('Stealth', 'Dexterity');
var arcana = new Skill('Arcana', 'Intelligence');
var hist = new Skill('History', 'Intelligence');
var investigation = new Skill('Investigation', 'Intelligence');
var nature = new Skill('Nature', 'Intelligence');
var religion = new Skill('Religion', 'Intelligence');
var animal = new Skill('Animal Handling', 'Wisdom');
var insight = new Skill('Insight', 'Wisdom');
var medicine = new Skill('Medicine', 'Wisdom');
var perception = new Skill('Perception', 'Wisdom');
var survival = new Skill('Survival', 'Wisdom');
var deception = new Skill('Deception', 'Charisma');
var intimidation = new Skill('Intimidation', 'Charisma');
var perform = new Skill('Performance', 'Charisma');
var persuasion = new Skill('Persuasion', 'Charisma');
var skills = [athletics, acrobatics, sleight, stealth, hist, investigation, nature, religion, animal, insight, medicine, perception, survival, deception, intimidation, perform, persuasion];

function Weapon(type, cost, damage, damage_type, weight, properties, ranged = false, martial = false) {
  this.type = type;
  this.cost = cost;
  this.damage = damage;
  this.damage_type = damage_type;
  this.weight = weight;
  this.properties = properties;
  this.ranged = ranged;
  this.martial = martial;
  this.display =
  '<tr class="equipment" onclick="equip(this)" id="' + this.type + '">'
  + '<td>' + type + '</td>'
  + '<td>' + cost + 'gp</td>'
  + '<td>' + damage.type + ' ' + damage_type + '</td>'
  + '<td>' + list(properties) + '</td>'
  + '</tr>';
}

var club = new Weapon('Club', 0.1, new Roll(4, 1), 'bludgeoning', 2, ['light']);
var dagger = new Weapon('Dagger', 2, new Roll(4, 1), 'piercing', 1, ['finesse', 'light', 'thrown']);
var greatclub = new Weapon('Greatclub', 0.2, new Roll(8, 1), 'bludgeoning', 10, ['two-handed']);
var handaxe = new Weapon('Handaxe', 5, new Roll(6, 1), 'slashing', 2, ['light, thrown']);
var javelin = new Weapon('Javelin', 0.5, new Roll(6, 1), 'piercing', 2, ['thrown']);
var light_hammer = new Weapon('Light hammer', 2, new Roll(4, 1), 'bludgeoning', 2, ['light', 'thrown']);
var mace = new Weapon('Mace', 5, new Roll(6, 1), 'bludgeoning', 4, ['-']);
var quarterstaff = new Weapon('Quarterstaff', 0.2, new Roll(6, 1), 'bludgeoning', 4, ['versatile']);
var sickle = new Weapon('Sickle', 1, new Roll(4, 1), 'slashing', 2, ['light']);
var spear = new Weapon('Spear', 1, new Roll(6, 1), 'piercing', 3, ['thrown', 'versatile']);
var light_crossbow = new Weapon('Light crossbow', 25, new Roll(8, 1), 'piercing', 5, ['ammunition', 'loading', 'two-handed'], true);
var dart = new Weapon('Dart', 0.05, new Roll(4, 1), 'piercing', 0.25, ['finesse', 'thrown'], true);
var shortbow = new Weapon('Shortbow', 25, new Roll(6, 1), 'piercing', 2, ['ammunition', 'two-handed'], true);
var sling = new Weapon('Sling', 0.1, new Roll(4, 1), 'bludgeoning', 0, ['ammunition'], true);
var battleaxe = new Weapon('Battleaxe', 10, new Roll(8, 1), 'slashing', 4, ['versatile'], false, true);
var flail = new Weapon('Flail', 10, new Roll(8, 1), 'bludgeoning', 2, ['-'], false, true);
var glaive = new Weapon('Glaive', 20, new Roll(10, 1), 'slashing', 6, ['heavy', 'reach', 'two-handed'], false, true);
var greataxe = new Weapon('Greataxe', 30, new Roll(12, 1), 'slashing', 7, ['heavy', 'two-handed']);
var greatsword = new Weapon('Greatsword', 50, new Roll(6, 2), 'slashing', 6, ['heavy', 'two-handed'], false, true);
var halberd = new Weapon('Halberd', 20, new Roll(10, 1), 'slashing', 6, ['heavy', 'reach', 'two-handed'], false, true);
var lance = new Weapon('Lance', 10, new Roll(12, 1), 'piercing', 6, ['reach', 'special'], false, true);
var longsword = new Weapon('Longsword', 15, new Roll(8, 1), 'slashing', 3, ['versatile'], false, true);
var maul = new Weapon('Maul', 10, new Roll(6, 2), 'bludgeoning', 10, ['heavy', 'two-handed'], false, true);
var morningstar = new Weapon('Morningstar', 15, new Roll(8, 1), 'piercing', 4, ['-'], false, true);
var pike = new Weapon('Pike', 5, new Roll(10, 1), 'piercing', 18, ['heavy', 'reach', 'two-handed'], false, true);
var rapier = new Weapon('Rapier', 25, new Roll(8, 1), 'piercing', 2, ['finesse'], false, true);
var scimitar = new Weapon('Scimitar', 25, new Roll(6, 1), 'slashing', 3, ['finesse', 'light'], false, true);
var shortsword = new Weapon('Shortsword', 10, new Roll(6, 1), 'piercing', 2, ['finesse', 'light'], false, true);
var trident = new Weapon('Trident', 5, new Roll(6, 1), 'piercing', 4, ['thrown', 'versatile'], false, true);
var warpick = new Weapon('War pick', 5, new Roll(8, 1), 'piercing', 2, ['-'], false, true);
var warhammer = new Weapon('Warhammer', 15, new Roll(8, 1), 'bludgeoning', 2, ['versatile'], false, true);
var whip = new Weapon('Whip', 2, new Roll(4, 1), 'slashing', 3, ['finesse', 'reach'], false, true);
var blowgun = new Weapon('Blowgun', 10, new Roll(1, 1), 'piercing', 1, ['ammunition', 'loading'], true, true);
var hand_crossbow = new Weapon('Hand crossbow', 75, new Roll(6, 1), 'piercing', 3, ['ammunition', 'light', 'loading'], true, true);
var heavy_crossbow = new Weapon('Heavy crossbow', 50, new Roll(10, 1), 'piercing', 18, ['ammunition', 'heavy', 'loading', 'two-handed'], true, true);
var longbow = new Weapon('Longbow', 50, new Roll(8, 1), 'piercing', 2, ['ammunition', 'heavy', 'two-handed'], true, true);
var net = new Weapon('Net', 1, new Roll(0, 1), '', 3, ['special', 'thrown'], true, true);
var weapons = [club, dagger, greatclub, handaxe, javelin, light_hammer, mace, quarterstaff, sickle, spear, light_crossbow, dart, shortbow, sling, battleaxe, flail, glaive, greataxe, greatsword, halberd, lance, longsword, maul, morningstar, pike, rapier, scimitar, shortsword, trident, warpick, warhammer, whip, blowgun, hand_crossbow, heavy_crossbow, longbow, net];

function Armor(type, cost, base_ac, strength_req, stealth_mod, size, weight) {
  this.type = type;
  this.cost = cost;
  this.base_ac = base_ac;
  this.strength_req = strength_req;
  this.stealth_mod = stealth_mod;
  this.size = size;
  this.weight = weight;
  this.display =
  '<tr class="equipment" onclick="equip(this)" id="' + this.type + '">'
  + '<td>' + type + '</td>'
  + '<td>' + cost + 'gp</td>'
  + '<td>' + base_ac + 'AC' +  (size == 'Light' ? ' + Dex modifier ' : '') + (size == 'Medium' ? ' + Dex modifier (max 2) ' : '') + '</td>'
  + '<td>Strength req: ' + strength_req + (stealth_mod == 'Disadvantage' ? ', disadv to Stealth' : '') + '</td>'
  + '</tr>';
}

var padded = new Armor('Padded', 5, 11, 0, 'Disadvantage', 'Light', 8);
var leather = new Armor('Leather', 10, 11, 0, '-', 'Light', 10);
var studded = new Armor('Studded leather', 45, 12, 0, '-', 'Light', 13);
var hide = new Armor('Hide', 10, 12, 0, '-', 'Medium', 12);
var chain_shirt = new Armor('Chain shirt', 50, 13, 0, '-', 'Medium', 20);
var scale = new Armor('Scale mail', 50, 14, 0, 'Disadvantage', 'Medium', 45);
var breastplate = new Armor('Breastplate', 400, 14, 0, '-', 'Medium', 20);
var half_plate = new Armor('Half plate', 750, 15, 0, 'Disadvantage', 'Medium', 40);
var ring = new Armor('Ring mail', 30, 14, 0, 'Disadvantage', 'Heavy', 40);
var chain = new Armor('Chain mail', 75, 16, 13, 'Disadvantage', 'Heavy', 55);
var split = new Armor('Splint', 200, 17, 15, 'Disadvantage', 'Heavy', 60);
var plate = new Armor('Plate', 1500, 18, 15, 'Disadvantage', 'Heavy', 65);
var armor = [padded, leather, studded, hide, chain_shirt, scale, breastplate, half_plate, ring, chain, split, plate];

function Shield(type, cost, ac_mod, strength_req, stealth_mod, size, weight) {
  this.type = type;
  this.cost = cost;
  this.ac_mod = ac_mod;
  this.strength_req = strength_req,
  this.stealth_mod = stealth_mod;
  this.size = size;
  this.weight = weight;
  this.display =
  '<tr class="equipment" onclick="equip(this)" id="' + this.type + '">'
  + '<td>' + type + '</td>'
  + '<td>' + cost + 'gp</td>'
  + '<td>+' + ac_mod + 'AC</td>'
  + '<td>Strength requirement: ' + strength_req + (stealth_mod == 'Disadvantage' ? ', disadvantage to Stealth' : '') + '</td>'
  + '</tr>';
}

var shields = [new Shield('Shield', 10, 2, '-', '-', 'Shield', 6)];
var equipment = weapons.concat(armor).concat(shields);

function Alignment(type, description) {
  this.type = type;
  this.display = description;
}

var lawful_good = new Alignment('Lawful Good', 'A lawful good character typically acts with compassion and always with honor and a sense of duty. Such characters include righteous knights, paladins, and most dwarves. Lawful good creatures include the noble golden dragons');
var neutral_good = new Alignment('Neutral Good', 'A neutral good character typically acts altruistically, without regard for or against lawful precepts such as rules or tradition. A neutral good character has no problems with cooperating with lawful officials, but does not feel beholden to them. In the event that doing the right thing requires the bending or breaking of rules, they do not suffer the same inner conflict that a lawful good character would.');
var chaotic_good = new Alignment('Chaotic Good', 'A chaotic good character does what is necessary to bring about change for the better, disdains bureaucratic organizations that get in the way of social improvement, and places a high value on personal freedom, not only for oneself, but for others as well. Chaotic good characters usually intend to do the right thing, but their methods are generally disorganized and often out of sync with the rest of society.');
var lawful_neutral = new Alignment('Lawful Neutral', 'A lawful neutral character typically believes strongly in lawful concepts such as honor, order, rules, and tradition, and often follows a personal code. Examples of lawful neutral characters include a soldier who always follows orders, a judge or enforcer that adheres mercilessly to the word of the law, and a disciplined monk.');
var true_neutral = new Alignment('True Neutral', 'A neutral character (a.k.a. true neutral) is neutral on both axes and tends not to feel strongly towards any alignment, or actively seeks their balance. Druids frequently follow this dedication to balance.  Animals without the capacity for moral judgment can be considered true neutral or unaligned.');
var chaotic_neutral = new Alignment('Chaotic Neutral', 'A chaotic neutral character is an individualist who follows their own heart and generally shirks rules and traditions. Although chaotic neutral characters promote the ideals of freedom, it is their own freedom that comes first; good and evil come second to their need to be free.');
var lawful_evil = new Alignment('Lawful Evil', 'A lawful evil character sees a well-ordered system as being easier to exploit and shows a combination of desirable and undesirable traits. Examples of this alignment include tyrants, devils, and undiscriminating mercenary types who have a strict code of conduct.');
var neutral_evil = new Alignment('Neutral Evil', 'A neutral evil character is typically selfish and has no qualms about turning on allies-of-the-moment, and usually makes allies primarily to further their own goals. A neutral evil character has no compunctions about harming others to get what they want, but neither will they go out of their way to cause carnage or mayhem when they see no direct benefit for themselves. Another valid interpretation of neutral evil holds up evil as an ideal, doing evil for evil\'s sake and trying to spread its influence. Examples of the first type are an assassin who has little regard for formal laws but does not needlessly kill, a henchman who plots behind their superior\'s back, or a mercenary who switches sides if made a better offer. An example of the second type would be a masked killer who strikes only for the sake of causing fear and distrust in the community.');
var chaotic_evil = new Alignment('Chaotic Evil', 'A chaotic evil character tends to have no respect for rules, other people\'s lives, or anything but their own desires, which are typically selfish and cruel. They set a high value on personal freedom, but do not have much regard for the lives or freedom of other people. Chaotic evil characters do not work well in groups because they resent being given orders and do not usually behave themselves unless there is no alternative.');
var alignments = [lawful_good, neutral_good, chaotic_good, lawful_neutral, true_neutral, chaotic_neutral, lawful_evil, neutral_evil, chaotic_evil];

function Background(type, skills, tools, languages, equipment, gold, feature) {
  this.type = type;
  this.skills = skills;
  this.tools = tools;
  this.languages = languages;
  this.equipment = equipment;
  this.gold = gold;
  this.feature = feature;
  this.display =
  '<p><b>Skill Proficiencies:</b> ' + list(skills) + '</p>'
  + '<p><b>Tool Proficiencies:</b> ' + list(tools) + '</p>'
  + '<p><b>Languages:</b> ' + list(languages) + '</p>'
  + '<p><b>Equipment:</b> ' + list(equipment) + '</p>'
  + '<p><b>Gold:</b> ' + gold + '</p>'
  + '<p><b>Feature:</b> ' + feature + '</p>';
}

var hermit = new Background('Hermit', ['Medicine', 'Religion'], ['Herbalism Kit'], ['Choice Language'], ['Scroll case of notes', 'Winter blanket', 'Common clothes', 'Herbalism kit'], 5, 'Discovery');
var urchin = new Background('Urchin', ['Sleight of Hand', 'Stealth'], ['Disguise Kit', 'thieves\' tools'], [], ['Small knife', 'Map of city', 'Pet mouse', 'Token from parents', 'Common clothes', 'Belt pouch'], 5, 'City Secrets');
var charlatan = new Background('Charlatan', ['Deception', 'Sleight of hand'], ['Disguise Kit', 'Forgery Kit'], [], ['Fine clothes', 'Disguise kit', 'Con tools', 'Belt pouch'], 15, 'False Identity');
var soldier = new Background('Soldier', ['Athletics', 'Intimidation'], ['Gaming set', 'Land vehicles'], [], ['Rank insignia', 'Trophy', 'Gaming set', 'Common clothes', 'Belt pouch'], 10, 'Military Rank');
var pirate = new Background('Sailor (Pirate)', ['Athletics', 'Perception'], ['Navigator\'s tools', 'Water vehicles'], [], ['Belaying pin', '50ft silk rope', 'Lucky charm', 'Common clothes', 'Belt pouch'], 10, 'Bad Reputation');
var sailor = new Background('Sailor', ['Athletics', 'Perception'], ['Navigator\'s tools', 'Water vehicles'], [], ['Belaying pin', '50ft silk rope', 'Lucky charm', 'Common clothes', 'Belt pouch'], 10, 'Ship\'s Passaage');
var sage = new Background('Sage', ['Arcana', 'History'], [], ['Choice Language', 'Choice Language'], ['Bottle of black ink', 'Quill', 'Small knife', 'Letter from dead colleague with unanswered question', 'Common clothes', 'Belt pouch'], 10, 'Researcher');
var criminal = new Background('Criminal', ['Deception', 'Stealth'], ['Gaming set', 'thieves\' tools'], [], ['Crowbar', 'Dark common clothes w/ hood', 'Belt pouch'], 15, 'Criminal Contact');
var spy = new Background('Criminal (Spy)', ['Deception', 'Stealth'], ['Gaming set', 'thieves\' tools'], [], ['Crowbar', 'Dark common clothes w/ hood', 'Belt puch'], 15, 'Spy Contact');
var entertainer = new Background('Entertainer', ['Acrobatics', 'Performance'], ['Disguise kit', 'Musical instrument'], [], ['Musical instrument', 'Admirer\'s favor', 'Costume', 'Belt pouch'], 15, 'By Popular Demand');
var gladiator = new Background('Entertainer (Gladiator)', ['Acrobatics', 'Performance'], ['Disguise kit', 'Musical instrument'], [], ['Inexpensive but unusual weapon', 'Admirer\'s favor', 'Costume', 'Belt puch'], 15, 'By Popular Demand');
var outlander = new Background('Outlander', ['Athletics', 'Survival'], ['Musical instrument'], ['Choice Language'], ['Staff', 'Hunting trap', 'Animal trophy', 'Traveler\'s clothes', 'Belt pouch'], 10, 'Wanderer');
var knight = new Background('Noble (Knight)', ['History', 'Persuasion'], ['Gaming set'], ['Choice Language'], ['Token of love', 'Fine clothes', 'Signet ring', 'Scroll of pedigree', 'Purse'], 25, 'Retainers');
var folk_hero = new Background('Folk hero', ['Animal Handling', 'Survival'], ['Artisan\'s tools', 'Land vehicles'], [], ['Artisan\'s tools', 'Shovel', 'Iron pot', 'Common clothes', 'Belt pouch'], 10, 'Rustic Hospitality');
var guild_artisan = new Background('Guild Artisan', ['Insight', 'Persuasion'], ['Artisan\'s tools'], [], ['Artisan\'s tools', 'Guild ltter of introduction', 'Traveler\'s clothes', 'Belt pouch'], 15, 'Guild Membership');
var merchant = new Background('Guild Artisan (Guild Merchant)', ['Insight', 'Persuasion'], ['Navigator\'s tools or language of choice'], [], ['Mule', 'Cart', 'Guild letter of introduciton', 'Traveler\'s clothes', 'Belt pouch'], 15, 'Guild Membership');
var acolyte = new Background('Acolyte', ['Insight', 'Religion'], [], ['Choice Language', 'Choice Language'], ['Holy symbol', 'Prayer book or prayer wheel', '5 sticks of incense', 'Vestments', 'Common clothes', 'Belt pouch'], 15, 'Shelter of the Faithful');
var noble = new Background('Noble', ['History', 'Persuasion'], ['Gaming set'], ['Choice Language'], ['Fine clothes', 'Signet ring', 'Scroll of pedigree', 'Purse'], 25, 'Position of Privilege');
var backgrounds = [hermit, urchin, charlatan, soldier, pirate, sailor, sage, criminal, spy, entertainer, gladiator, outlander, knight, folk_hero, guild_artisan, merchant, acolyte, noble];

function Class(type, abilities, cantrips, spells, spell_slots, start_gold, hit_die, proficiencies, tools, saving_throws, num_skills, skills) {
  this.type = type;
  this.abilities = abilities;
  this.cantrips = cantrips;
  this.spells = spells;
  this.spell_slots = spell_slots;
  this.start_gold = start_gold;
  this.hit_die = hit_die;
  this.proficiencies = {
    armor: [],
    weapons: [],
  };
  for (var i of proficiencies) {
    if (i == 'light' || i == 'medium' || i == 'heavy' || i == 'shields')
      this.proficiencies.armor.push(i);
    else
      this.proficiencies.weapons.push(i);
  }
  this.saving_throws = saving_throws;
  this.tools = tools;
  this.num_skills = num_skills;
  this.skills = skills;
  this.display =
    '<p><b>Abilities:</b> ' + list(abilities) + '</p>'
    + '<p><b>Cantrips, Spells, Spell slots:</b> ' + cantrips + ', ' + spells + ', ' + spell_slots + '</p>'
    + '<p><b>Starting Gold:</b> ' + start_gold.type + '</p>'
    + '<p><b>Hit Dice:</b> ' + hit_die.type + '</p>'
    + '<p><b>Proficiencies:</b></p>'
    + '<p><b> - Armor:</b> ' + list(this.proficiencies.armor) + '</p>'
    + '<p><b> - Weapons:</b> ' + list(this.proficiencies.weapons) + '</p>'
    + '<p><b> - Tools:</b> ' + list(tools) + '</p>'
    + '<p><b>Saving Throws:</b> ' + list(saving_throws) + '</p>'
    + '<p><b>Skills:</b> Choose ' + num_skills + ' from ' + list(skills) + '</p>';;
}

var barbarian = new Class('Barbarian', ['Rage', 'Unarmored Defense'], 0, 0, 0, new Roll(4, 2, 0, 10), new Roll(12, 1), ['light', 'medium', 'shields', 'simple', 'martial'], ['None'], ['Strength', 'Constitution'], 2, [animal, athletics, intimidation, nature, perception, survival]);
var bard = new Class('Bard', ['Bardic Inspiration', 'Spellcasting'], 2, 4, 2, new Roll(4, 5, 0, 10), new Roll(8, 1), ['light', 'simple', 'hand crossbow', 'longsword', 'rapier', 'shortsword'], ['3 musical instruments of choice'], ['Dexterity', 'Charisma'], 3, skills);
var cleric = new Class('Cleric', ['Spellcasting', 'Divine Domain'], 3, 0, 2, new Roll(4, 5, 0, 10), new Roll(8, 1), ['light', 'medium', 'shields', 'simple'], ['None'], ['Wisdom', 'Charisma'], 2, [history, insight, medicine, persuasion, religion]);
var druid = new Class('Druid', ['Druidic', 'Spellcasting'], 2, 0, 2, new Roll(4, 2, 0, 10), new Roll(8, 1), ['light', 'medium', 'shields', 'club', 'dagger', 'dart', 'javelin', 'mace', 'quarterstaff', 'scimitar', 'sickle', 'sling', 'spear'], ['Herbalism kit'], ['Intelligence', 'Wisdom'], 2, [arcana, animal, insight, medicine, nature, perception, religion, survival]);
var fighter = new Class('Fighter', ['Fighting Style', 'Second Wind'], 0, 0, 0, new Roll(4, 5, 0, 10), new Roll(10, 1), ['light', 'medium', 'heavy', 'shields', 'simple', 'martial'], ['None'], ['Strength', 'Constitution'], 2, [acrobatics, animal, athletics, history, insight, intimidation, perception, survival]);
var monk = new Class('Monk', ['Unarmored Defense', 'Martial Arts'], 0, 0, 0, new Roll(4, 5, 0, 1), new Roll(8, 1), ['simple', 'shortsword'], ['Artisan\'s tools or Musical instrument'], ['Strength', 'Dexterity'], 2, [acrobatics, athletics, history, insight, religion, stealth]);
var paladin = new Class('Paladin', ['Divine Sense', 'Lay on Hands'], 0, 0, 0, new Roll(4, 5, 0, 10), new Roll(10, 1), ['light', 'medium', 'heavy', 'shields', 'simple', 'martial'], ['None'], ['Wisdom', 'Charisma'], 2, [athletics, insight, intimidation, medicine, persuasion, religion]);
var ranger = new Class('Ranger', ['Favored Enemy', 'Natural Explorer'], 0, 0, 0, new Roll(4, 5, 0, 10), new Roll(10, 1), ['light', 'medium', 'shields', 'simple', 'martial'], ['None'], ['Strength', 'Dexterity'], 3, [animal, athletics, insight, investigation, nature, perception, stealth, survival]);
var rogue = new Class('Rogue', ['Expertise', 'Sneak Attack', 'Thieves\'s Cant'], 0, 0, 0, new Roll(4, 4, 0, 10), new Roll(8, 1), ['light', 'simple', 'hand crossbow', 'longsword', 'rapier', 'shortsword'], ['Thieve\'s tools'], ['Dexterity', 'Intelligence'], 4, [acrobatics, athletics, deception, insight, intimidation, investigation, perception, perform, persuasion, sleight, stealth]);
var sorcerer = new Class('Sorcerer', ['Spellcasting', 'Sorcerous Origin'], 4, 2, 2, new Roll(4, 3, 0, 10), new Roll(6, 1), ['dagger', 'dart', 'sling', 'quarterstaff', 'light crossbow'], ['None'], ['Constitution', 'Charisma'], 2, [arcana, deception, insight, intimidation, persuasion, religion]);
var warlock = new Class('Warlock', ['Pact Magic', 'Otherworldly Patron'], 2, 2, 1, new Roll(4, 4, 0, 10), new Roll(8, 1), ['light', 'simple'], ['None'], ['Wisdom', 'Charisma'], 2, [arcana, deception, history, intimidation, investigation, nature, religion]);
var wizard = new Class('Wizard', ['Arcane Recovery', 'Spellcasting'], 3, 0, 2, new Roll(4, 4, 0, 10), new Roll(6, 1), ['dagger', 'dart', 'sling', 'quarterstaff', 'light crossbow'], ['None'], ['Intelligence', 'Wisdom'], 2, [arcana, history, insight, investigation, medicine, religion]);
var classes = [barbarian, bard, cleric, druid, fighter, monk, paladin, ranger, rogue, sorcerer, warlock, wizard];

function Race(type, size, stats, languages, abilities) {
  this.type = type;
  this.size = size;
  this.stats = stats;
  this.languages = languages;
  this.abilities = abilities;
  this.display =
    '<p><b>Size:</b> ' + size + '</p>'
    + '<p><b>Str:</b> +' + stats[0] + '</p>'
    + '<p><b>Dex:</b> +' + stats[1] + '</p>'
    + '<p><b>Con:</b> +' + stats[2] + '</p>'
    + '<p><b>Int:</b> +' + stats[3] + '</p>'
    + '<p><b>Wis:</b> +' + stats[4] + '</p>'
    + '<p><b>Cha:</b> +' + stats[5] + '</p>'
    + '<p><b>Languages:</b> ' + list(languages) + '</p>'
    + '<p><b>Abilities:</b> ' + list(abilities) + '</p>';
  if (stats[6]) {
    var temp = this.display
    var spot = temp.indexOf('<p><b>Languages:</b> ');
    this.display = [temp.slice(0, spot), '<p>' + stats[6] + '</p>', temp.slice(spot)].join('');
  }
}

var forest_gnome = new Race('Gnome (Forest)', 'Small', [0, 1, 0, 2, 0, 0], ['Common', 'Gnomish'], ['Darkvision', 'Gnome Cunning', 'Natural Illusionist', 'Speak with Small Beasts']);
var hill_dwarf = new Race('Dwarf (Hill)', 'Medium', [0, 0, 2, 0, 1, 0], ['Common', 'Dwarvish'], ['Speed', 'Darkvision', 'Dwarven Resilience', 'Dwarven Combat Training', 'Tool Proficiency', 'Stonecunning', 'Dwarven Toughness']);
var amonkhet_human = new Race('Human (Amonkhet)', 'Medium', [0, 0, 0, 0, 0, 0, 'Choose any two +1'], ['Common', 'Choice Language'], ['Skills', 'Feat']);
var drow_elf = new Race('Elf (Drow)', 'Medium', [0, 2, 0, 0, 0, 1], ['Common', 'Elvish'], ['Superior Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance', 'Sunlight Sensitivity', 'Drow magic', 'Drow Weapon Training']);
var dragonborn = new Race('Dragonborn', 'Medium', [2, 0, 0, 0, 0, 1], ['Common', 'Draconic'], ['Draconic Ancestry', 'Breath Weapon', 'Damage Resistance']);
var human = new Race('Human', 'Medium', [1, 1, 1, 1, 1, 1], ['Common', 'Choice Language'], []);
var high_elf = new Race('Elf (High)', 'Medium', [0, 2, 0, 1, 0, 0], ['Common, Elvish'], ['Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance', 'Elf Weapon Training', 'Cantrip']);
var stout_halfling = new Race('Halfling (Stout)', 'Small', [0, 2, 1, 0, 0, 0], ['Common', 'Halfling'], ['Lucky', 'Brave', 'Halfling Nimbleness', 'Stout Resilience']);
var lightfoot_halfling = new Race('Halfling (Lightfoot)', 'Small', [0, 2, 0, 0, 0, 1], ['Common', 'Halfling'], ['Lucky', 'Brave', 'Halfling Nimbleness', 'Naturally Stealthy']);
var half_orc = new Race('Half-Orc', 'Medium', [2, 1, 0, 0, 0, 0], ['Common', 'Orc'], ['Darkvision', 'Menacing', 'Relentless Endurance', 'Savage Attacks']);
var half_elf = new Race('Half-Elf', 'Medium', [0, 0, 0, 0, 0, 2, 'Choose any other two +1'], ['Common', 'Elvish', 'Choice Language'], ['Darkvision', 'Fey Ancestry', 'Skill Versatility']);
var wood_elf = new Race('Elf (Wood)', 'Medium', [0, 2, 0, 0, 1, 0], ['Common, Elvish'], ['Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance', 'Elf Weapon Training', 'Fleet of Foot', 'Mask of the Wild']);
var rock_gnome = new Race('Gnome (Rock)', 'Small', [0, 0, 1, 2, 0, 0], ['Common', 'Gnomish'], ['Darkvision', 'Gnome Cunning', 'Artificer\'s Lore', 'Tinker']);
var mountain_dwarf = new Race('Dwarf (Mountain)', 'Medium', [2, 2, 0, 0, 0, 0], ['Common', 'Dwarvish'], ['Speed', 'Darkvision', 'Dwarven Resilience', 'Dwarven Combat Training', 'Tool Proficiency', 'Stonecunning', 'Dwarven Armor Training']);
var infernal_tiefling = new Race('Tiefling (Infernal)', 'Medium', [0, 0, 0, 1, 0, 2], ['Common', 'Infernal'], ['Darkvision', 'Hellish Resistance', 'Infernal Legacy']);
var variant_human = new Race('Human (Variant)', 'Medium', [0, 0, 0, 0, 0, 0, 'Choose any two +1'], ['Common', 'Choice Language'], ['Skills', 'Feat']);
var races = [forest_gnome, hill_dwarf, amonkhet_human, drow_elf, dragonborn, human, high_elf, stout_halfling, lightfoot_halfling, half_orc, half_elf, wood_elf, rock_gnome, mountain_dwarf, infernal_tiefling, variant_human];

//has to go at the end
race_select = new Status('race', 'Choose a Race', races, null);
class_select = new Status('class', 'Choose a Class', classes, race_select);
background_select = new Status('background', 'Choose a Background', backgrounds, class_select);
alignment_select = new Status('alignment', 'Choose an Alignment', alignments, background_select);
equipment_select = new Status('equipment', 'Choose Starting Equipment', equipment,  alignment_select);
rolling = new Status('rolling', 'Roll Your Stats', [], equipment_select);
var statuses = [race_select, class_select, background_select, alignment_select];
