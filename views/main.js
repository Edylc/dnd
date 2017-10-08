//Alignment, rolling stats
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
});

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
  $('#instruction').fadeOut(200);
  $('.options').fadeOut(200);
  $('.details').fadeOut(200);

  setTimeout(function() {
    $('#instruction').html(target.instruction);
    $('.options').html(makeButtons(target.options));
  }, 200);

  $('#instruction').fadeIn(200);
  $('.options').fadeIn(200);
  $('#prev_button').fadeIn();
  $('#next_button').fadeIn();
  return target;
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
  for (var i of races.concat(classes).concat(backgrounds).concat(alignments)/*.concat(equipment)*/) {
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
  for (var i of li)
    ans += i + ', ';
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

var race_select, class_select, background_select, alignment_select, equipment_select;
// GAMEPLAY ABSTRACTIONS

function Player() {
  this.username;
  this.class;
  this.race;
  this.stats;
  this.hp;
  this.alignment;
  this.proficiency;
  this.level;
  this.skills;
  this.gold;
  this.equipment;
}

var player = new Player();

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

var hermit = new Background('Hermit', ['Medicine', 'Religion'], ['Herbalism Kit'], ['Choice'], ['Scroll case of notes', 'Winter blanket', 'Common clothes', 'Herbalism kit'], 5, 'Discovery');
var urchin = new Background('Urchin', ['Sleight of Hand', 'Stealth'], ['Disguise Kit', 'thieves\' tools'], [], ['Small knife', 'Map of city', 'Pet mouse', 'Token from parents', 'Common clothes', 'Belt pouch'], 5, 'City Secrets');
var charlatan = new Background('Charlatan', ['Deception', 'Sleight of hand'], ['Disguise Kit', 'Forgery Kit'], [], ['Fine clothes', 'Disguise kit', 'Con tools', 'Belt pouch'], 15, 'False Identity');
var soldier = new Background('Soldier', ['Athletics', 'Intimidation'], ['Gaming set', 'Land vehicles'], [], ['Rank insignia', 'Trophy', 'Gaming set', 'Common clothes', 'Belt pouch'], 10, 'Military Rank');
var pirate = new Background('Sailor (Pirate)', ['Athletics', 'Perception'], ['Navigator\'s tools', 'Water vehicles'], [], ['Belaying pin', '50ft silk rope', 'Lucky charm', 'Common clothes', 'Belt pouch'], 10, 'Bad Reputation');
var sailor = new Background('Sailor', ['Athletics', 'Perception'], ['Navigator\'s tools', 'Water vehicles'], [], ['Belaying pin', '50ft silk rope', 'Lucky charm', 'Common clothes', 'Belt pouch'], 10, 'Ship\'s Passaage');
var sage = new Background('Sage', ['Arcana', 'History'], [], ['Choice', 'Choice'], ['Bottle of black ink', 'Quill', 'Small knife', 'Letter from dead colleague with unanswered question', 'Common clothes', 'Belt pouch'], 10, 'Researcher');
var criminal = new Background('Criminal', ['Deception', 'Stealth'], ['Gaming set', 'thieves\' tools'], [], ['Crowbar', 'Dark common clothes w/ hood', 'Belt pouch'], 15, 'Criminal Contact');
var spy = new Background('Criminal (Spy)', ['Deception', 'Stealth'], ['Gaming set', 'thieves\' tools'], [], ['Crowbar', 'Dark common clothes w/ hood', 'Belt puch'], 15, 'Spy Contact');
var entertainer = new Background('Entertainer', ['Acrobatics', 'Performance'], ['Disguise kit', 'Musical instrument'], [], ['Musical instrument', 'Admirer\'s favor', 'Costume', 'Belt pouch'], 15, 'By Popular Demand');
var gladiator = new Background('Entertainer (Gladiator)', ['Acrobatics', 'Performance'], ['Disguise kit', 'Musical instrument'], [], ['Inexpensive but unusual weapon', 'Admirer\'s favor', 'Costume', 'Belt puch'], 15, 'By Popular Demand');
var outlander = new Background('Outlander', ['Athletics', 'Survival'], ['Musical instrument'], ['Choice'], ['Staff', 'Hunting trap', 'Animal trophy', 'Traveler\'s clothes', 'Belt pouch'], 10, 'Wanderer');
var knight = new Background('Noble (Knight)', ['History', 'Persuasion'], ['Gaming set'], ['Choice'], ['Token of love', 'Fine clothes', 'Signet ring', 'Scroll of pedigree', 'Purse'], 25, 'Retainers');
var folk_hero = new Background('Folk hero', ['Animal Handling', 'Survival'], ['Artisan\'s tools', 'Land vehicles'], [], ['Artisan\'s tools', 'Shovel', 'Iron pot', 'Common clothes', 'Belt pouch'], 10, 'Rustic Hospitality');
var guild_artisan = new Background('Guild Artisan', ['Insight', 'Persuasion'], ['Artisan\'s tools'], [], ['Artisan\'s tools', 'Guild ltter of introduction', 'Traveler\'s clothes', 'Belt pouch'], 15, 'Guild Membership');
var merchant = new Background('Guild Artisan (Guild Merchant)', ['Insight', 'Persuasion'], ['Navigator\'s tools or language of choice'], [], ['Mule', 'Cart', 'Guild letter of introduciton', 'Traveler\'s clothes', 'Belt pouch'], 15, 'Guild Membership');
var acolyte = new Background('Acolyte', ['Insight', 'Religion'], [], ['Choice', 'Choice'], ['Holy symbol', 'Prayer book or prayer wheel', '5 sticks of incense', 'Vestments', 'Common clothes', 'Belt pouch'], 15, 'Shelter of the Faithful');
var noble = new Background('Noble', ['History', 'Persuasion'], ['Gaming set'], ['Choice'], ['Fine clothes', 'Signet ring', 'Scroll of pedigree', 'Purse'], 25, 'Position of Privilege');
var backgrounds = [hermit, urchin, charlatan, soldier, pirate, sailor, sage, criminal, spy, entertainer, gladiator, outlander, knight, folk_hero, guild_artisan, merchant, acolyte, noble];

function Class(type, abilities, cantrips, spells, spell_slots) {
  this.type = type;
  this.abilities = abilities;
  this.cantrips = cantrips;
  this.spells = spells;
  this.spell_slots = spell_slots;
  this.display =
    '<p><b>Abilities:</b> ' + list(abilities) + '</p>'
    + '<p><b>Cantrips:</b> ' + cantrips + '</p>'
    + '<p><b>Spells:</b> ' + spells + '</p>'
    + '<p><b>Spell Slots:</b> ' + spell_slots + '</p>';
}
var barbarian = new Class('Barbarian', ['Rage', 'Unarmored Defense'], 0, 0, 0);
var bard = new Class('Bard', ['Bardic Inspiration', 'Spellcasting'], 2, 4, 2);
var cleric = new Class('Cleric', ['Spellcasting', 'Divine Domain'], 3, 0, 2);
var druid = new Class('Druid', ['Druidic', 'Spellcasting', 2, 0, 2]);
var fighter = new Class('Fighter', ['Fighting Style', 'Second Wind'], 0, 0, 0);
var monk = new Class('Monk', ['Unarmored Defense', 'Martial Arts'], 0, 0, 0);
var paladin = new Class('Paladin', ['Divine Sense', 'Lay on Hands'], 0, 0, 0);
var ranger = new Class('Ranger', ['Favored Enemy', 'Natural Explorer'], 0, 0, 0);
var rogue = new Class('Rogue', ['Expertise', 'Sneak Attack', 'Thieves\'s Cant'], 0, 0, 0);
var sorcerer = new Class('Sorcerer', ['Spellcasting', 'Sorcerous Origin'], 4, 2, 2);
var warlock = new Class('Warlock', ['Pact Magic', 'Otherworldly Patron'], 2, 2, 1);
var wizard = new Class('Wizard', ['Arcane Recovery', 'Spellcasting'], 3, 0, 2);
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
var hill_dwarf = new Race('Dwarf (Hill)', 'Medium', [0, 0, 2, 0, 1, 0], ['Common', 'Dwarvish'], ['Speed', 'Darvision', 'Dwarven Resilience', 'Dwarven Combat Training', 'Tool Proficiency', 'Stonecunning', 'Languages', 'Dwarven Toughness']);
var amonkhet_human = new Race('Human (Amonkhet)', 'Medium', [0, 0, 0, 0, 0, 0, 'Choose any two +1'], ['Skills', 'Feat'], ['Common', 'Choice']);
var drow_elf = new Race('Elf (Drow)', 'Medium', [0, 2, 0, 0, 0, 1], ['Superior Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance', 'Sunlight Sensitivity', 'Drow magic', 'Drow Weapon Training'], ['Common', 'Elvish']);
var dragonborn = new Race('Dragonborn', 'Medium', [2, 0, 0, 0, 0, 1], ['Draconic Ancestry', 'Breath Weapon', 'Damage Resistance'], ['Common', 'Draconic']);
var human = new Race('Human', 'Medium', [1, 1, 1, 1, 1, 1], [], ['Common', 'Choice']);
var high_elf = new Race('Elf (High)', 'Medium', [0, 2, 0, 1, 0, 0], ['Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance', 'Elf Weapon Training', 'Cantrip'], ['Common, Elvish']);
var stout_halfling = new Race('Halfling (Stout)', 'Small', [0, 2, 1, 0, 0, 0], ['Lucky', 'Brave', 'Halfling Nimbleness', 'Stout Resilience'], ['Common', 'Halfling']);
var lightfoot_halfling = new Race('Halfling (Lightfoot)', 'Small', [0, 2, 0, 0, 0, 1], ['Lucky', 'Brave', 'Halfling Nimbleness', 'Naturally Stealthy'], ['Common', 'Halfling']);
var half_orc = new Race('Half-Orc', 'Medium', [2, 1, 0, 0, 0, 0], ['Darkvision', 'Menacing', 'Relentless Endurance', 'Savage Attacks'], ['Common', 'Orc']);
var half_elf = new Race('Half-Elf', 'Medium', [0, 0, 0, 0, 0, 2, 'Choose any other two +1'], ['Darkvision', 'Fey Ancestry', 'Skill Versatility'], ['Common', 'Elvish', 'Choice']);
var wood_elf = new Race('Elf (Wood)', 'Medium', [0, 2, 0, 0, 1, 0], ['Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance', 'Elf Weapon Training', 'Fleet of Foot', 'Mask of the Wild'], ['Common, Elvish']);
var rock_gnome = new Race('Gnome (Rock)', 'Small', [0, 0, 1, 2, 0, 0], ['Darkvision', 'Gnome Cunning', 'Artificer\'s Lore', 'Tinker'], ['Common', 'Gnomish']);
var mountain_dwarf = new Race('Dwarf (Mountain)', 'Medium', [2, 2, 0, 0, 0, 0], ['Speed', 'Darkvision', 'Dwarven Resilience', 'Dwarven Combat Training', 'Tool Proficiency', 'Stonecunning', 'Dwarven Armor Training'], ['Common', 'Dwarvish']);
var infernal_tiefling = new Race('Tiefling (Infernal)', 'Medium', [0, 0, 0, 1, 0, 2], ['Darkvision', 'Hellish Resistance', 'Infernal Legacy'], ['Common', 'Infernal']);
var variant_human = new Race('Human (Variant)', 'Medium', [0, 0, 0, 0, 0, 0, 'Choose any two +1'], ['Skills', 'Feat'], ['Common', 'Choice']);
var races = [forest_gnome, hill_dwarf, amonkhet_human, drow_elf, dragonborn, human, high_elf, stout_halfling, lightfoot_halfling, half_orc, half_elf, wood_elf, rock_gnome, mountain_dwarf, infernal_tiefling, variant_human];

//has to go at the end
race_select = new Status('race', 'Choose a Race', races, null);
class_select = new Status('class', 'Choose a Class', classes, race_select);
background_select = new Status('background', 'Choose a Background', backgrounds, class_select);
alignment_select = new Status('alignment', 'Choose an Alignment', alignments, background_select);
//equipment_select = new Status('equipment', 'Choose Starting Equipment', equipment, alignment_select);
//rolling = new Status('rolling', 'Roll Your Stats', eqipment_select);
