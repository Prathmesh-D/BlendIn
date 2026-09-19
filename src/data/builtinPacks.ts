/**
 * BlendIn — Built-in Word Pack Data (P1.1)
 *
 * Six launch packs: Actors, Movies, Anime, Food, Animals, Everyday Objects.
 * Each entry has primary_word + three decoy tiers + hint_text + mirror_group_id.
 * Minimum 20 entries per pack, all decoy tiers populated.
 *
 * mirror_group_id: Groups 4-8 related words for Mirror Rounds.
 * Naming: "{pack}-{group}-{nn}" e.g. "food-italian-01"
 */

export interface WordEntry {
  id: string;
  primary_word: string;
  decoy_easy: string;    // closely related (same category sub-type)
  decoy_medium: string;  // somewhat related (same broad category)
  decoy_hard: string;    // loosely related (requires lateral thinking)
  hint_text: string;     // one-line clue for Hint Imposter variant
  mirror_group_id: string;
}

export interface WordPack {
  id: string;
  name: string;
  description: string;
  words: WordEntry[];
  is_restricted?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PACK 1: Actors
// ─────────────────────────────────────────────────────────────────────────────
const actorsPack: WordPack = {
  id: 'builtin-actors',
  name: 'Actors',
  description: 'Hollywood stars and iconic performers',
  words: [
    { id: 'act-01', primary_word: 'Tom Hanks', decoy_easy: 'Adam Sandler', decoy_medium: 'Tom Cruise', decoy_hard: 'Denzel Washington', hint_text: 'Beloved leading man with everyman charm', mirror_group_id: 'actors-group-00' },
    { id: 'act-02', primary_word: 'Leonardo DiCaprio', decoy_easy: 'Brad Pitt', decoy_medium: 'Matt Damon', decoy_hard: 'Tom Cruise', hint_text: 'A-list star known for intense roles', mirror_group_id: 'actors-group-00' },
    { id: 'act-03', primary_word: 'Brad Pitt', decoy_easy: 'George Clooney', decoy_medium: 'Matt Damon', decoy_hard: 'Leonardo DiCaprio', hint_text: 'Charismatic Hollywood heartthrob and producer', mirror_group_id: 'actors-group-00' },
    { id: 'act-04', primary_word: 'Denzel Washington', decoy_easy: 'Morgan Freeman', decoy_medium: 'Samuel L Jackson', decoy_hard: 'Will Smith', hint_text: 'Commanding actor with powerful presence', mirror_group_id: 'actors-group-00' },
    { id: 'act-05', primary_word: 'Morgan Freeman', decoy_easy: 'Denzel Washington', decoy_medium: 'Samuel L Jackson', decoy_hard: 'Anthony Hopkins', hint_text: 'Distinguished voice known for gravitas', mirror_group_id: 'actors-group-00' },
    { id: 'act-06', primary_word: 'Meryl Streep', decoy_easy: 'Judi Dench', decoy_medium: 'Cate Blanchett', decoy_hard: 'Glenn Close', hint_text: 'Acclaimed actress with many nominations', mirror_group_id: 'actors-group-01' },
    { id: 'act-07', primary_word: 'Robert De Niro', decoy_easy: 'Al Pacino', decoy_medium: 'Joe Pesci', decoy_hard: 'Jack Nicholson', hint_text: 'Legendary actor of gritty dramas', mirror_group_id: 'actors-group-01' },
    { id: 'act-08', primary_word: 'Al Pacino', decoy_easy: 'Robert De Niro', decoy_medium: 'Jack Nicholson', decoy_hard: 'Joe Pesci', hint_text: 'Iconic star of crime films', mirror_group_id: 'actors-group-01' },
    { id: 'act-09', primary_word: 'Jack Nicholson', decoy_easy: 'Al Pacino', decoy_medium: 'Robert De Niro', decoy_hard: 'Dustin Hoffman', hint_text: 'Veteran actor with rebellious edge', mirror_group_id: 'actors-group-01' },
    { id: 'act-10', primary_word: 'Johnny Depp', decoy_easy: 'Brad Pitt', decoy_medium: 'Christian Bale', decoy_hard: 'Leonardo DiCaprio', hint_text: 'Eccentric actor known for transformations', mirror_group_id: 'actors-group-01' },
    { id: 'act-11', primary_word: 'Will Smith', decoy_easy: 'Denzel Washington', decoy_medium: 'Eddie Murphy', decoy_hard: 'Dwayne Johnson', hint_text: 'Charismatic star who crossed into blockbusters', mirror_group_id: 'actors-group-02' },
    { id: 'act-12', primary_word: 'Dwayne Johnson', decoy_easy: 'Vin Diesel', decoy_medium: 'Jason Statham', decoy_hard: 'Chris Hemsworth', hint_text: 'Muscular action star with charisma', mirror_group_id: 'actors-group-02' },
    { id: 'act-13', primary_word: 'Vin Diesel', decoy_easy: 'Dwayne Johnson', decoy_medium: 'Jason Statham', decoy_hard: 'Chris Hemsworth', hint_text: 'Gruff action hero with franchise fame', mirror_group_id: 'actors-group-02' },
    { id: 'act-14', primary_word: 'Chris Hemsworth', decoy_easy: 'Chris Evans', decoy_medium: 'Chris Pratt', decoy_hard: 'Tom Hiddleston', hint_text: 'Superhero actor with Australian roots', mirror_group_id: 'actors-group-02' },
    { id: 'act-15', primary_word: 'Chris Evans', decoy_easy: 'Chris Hemsworth', decoy_medium: 'Chris Pratt', decoy_hard: 'Sebastian Stan', hint_text: 'Superhero actor with earnest charm', mirror_group_id: 'actors-group-02' },
    { id: 'act-16', primary_word: 'Robert Downey Jr', decoy_easy: 'Chris Evans', decoy_medium: 'Chris Hemsworth', decoy_hard: 'Mark Ruffalo', hint_text: 'Witty actor famous for superhero role', mirror_group_id: 'actors-group-03' },
    { id: 'act-17', primary_word: 'Scarlett Johansson', decoy_easy: 'Jennifer Lawrence', decoy_medium: 'Natalie Portman', decoy_hard: 'Emma Stone', hint_text: 'Versatile actress and blockbuster star', mirror_group_id: 'actors-group-03' },
    { id: 'act-18', primary_word: 'Jennifer Lawrence', decoy_easy: 'Emma Stone', decoy_medium: 'Scarlett Johansson', decoy_hard: 'Emma Watson', hint_text: 'Young Oscar winner turned franchise star', mirror_group_id: 'actors-group-03' },
    { id: 'act-19', primary_word: 'Emma Stone', decoy_easy: 'Jennifer Lawrence', decoy_medium: 'Emma Watson', decoy_hard: 'Amy Adams', hint_text: 'Witty actress known for comedic timing', mirror_group_id: 'actors-group-03' },
    { id: 'act-20', primary_word: 'Natalie Portman', decoy_easy: 'Cate Blanchett', decoy_medium: 'Nicole Kidman', decoy_hard: 'Scarlett Johansson', hint_text: 'Elegant actress with early child stardom', mirror_group_id: 'actors-group-03' },
    { id: 'act-21', primary_word: 'Cate Blanchett', decoy_easy: 'Meryl Streep', decoy_medium: 'Nicole Kidman', decoy_hard: 'Natalie Portman', hint_text: 'Chameleon-like actress of period dramas', mirror_group_id: 'actors-group-04' },
    { id: 'act-22', primary_word: 'Nicole Kidman', decoy_easy: 'Cate Blanchett', decoy_medium: 'Naomi Watts', decoy_hard: 'Charlize Theron', hint_text: 'Striking actress known for range', mirror_group_id: 'actors-group-04' },
    { id: 'act-23', primary_word: 'Charlize Theron', decoy_easy: 'Nicole Kidman', decoy_medium: 'Naomi Watts', decoy_hard: 'Angelina Jolie', hint_text: 'Statuesque actress in action roles', mirror_group_id: 'actors-group-04' },
    { id: 'act-24', primary_word: 'Angelina Jolie', decoy_easy: 'Charlize Theron', decoy_medium: 'Uma Thurman', decoy_hard: 'Scarlett Johansson', hint_text: 'Glamorous star turned action heroine', mirror_group_id: 'actors-group-04' },
    { id: 'act-25', primary_word: 'Julia Roberts', decoy_easy: 'Sandra Bullock', decoy_medium: 'Reese Witherspoon', decoy_hard: 'Meg Ryan', hint_text: 'America\'s sweetheart of romantic comedies', mirror_group_id: 'actors-group-04' },
    { id: 'act-26', primary_word: 'Sandra Bullock', decoy_easy: 'Julia Roberts', decoy_medium: 'Reese Witherspoon', decoy_hard: 'Meg Ryan', hint_text: 'Likable star of comedies and dramas', mirror_group_id: 'actors-group-05' },
    { id: 'act-27', primary_word: 'Reese Witherspoon', decoy_easy: 'Sandra Bullock', decoy_medium: 'Julia Roberts', decoy_hard: 'Amy Adams', hint_text: 'Southern charm meets comedic roles', mirror_group_id: 'actors-group-05' },
    { id: 'act-28', primary_word: 'Tom Cruise', decoy_easy: 'Tom Hanks', decoy_medium: 'Harrison Ford', decoy_hard: 'Leonardo DiCaprio', hint_text: 'Action star known for daring stunts', mirror_group_id: 'actors-group-05' },
    { id: 'act-29', primary_word: 'Harrison Ford', decoy_easy: 'Tom Cruise', decoy_medium: 'Mel Gibson', decoy_hard: 'Sean Connery', hint_text: 'Rugged star of adventure franchises', mirror_group_id: 'actors-group-05' },
    { id: 'act-30', primary_word: 'Sean Connery', decoy_easy: 'Harrison Ford', decoy_medium: 'Roger Moore', decoy_hard: 'Pierce Brosnan', hint_text: 'Suave actor known for spy role', mirror_group_id: 'actors-group-05' },
    { id: 'act-31', primary_word: 'Pierce Brosnan', decoy_easy: 'Sean Connery', decoy_medium: 'Roger Moore', decoy_hard: 'Daniel Craig', hint_text: 'Debonair actor in spy franchise', mirror_group_id: 'actors-group-06' },
    { id: 'act-32', primary_word: 'Daniel Craig', decoy_easy: 'Pierce Brosnan', decoy_medium: 'Sean Connery', decoy_hard: 'Idris Elba', hint_text: 'Gritty modern take on spy role', mirror_group_id: 'actors-group-06' },
    { id: 'act-33', primary_word: 'Idris Elba', decoy_easy: 'Daniel Craig', decoy_medium: 'Denzel Washington', decoy_hard: 'Chiwetel Ejiofor', hint_text: 'Suave British actor with commanding voice', mirror_group_id: 'actors-group-06' },
    { id: 'act-34', primary_word: 'Christian Bale', decoy_easy: 'Heath Ledger', decoy_medium: 'Leonardo DiCaprio', decoy_hard: 'Joaquin Phoenix', hint_text: 'Intense method actor of dark roles', mirror_group_id: 'actors-group-06' },
    { id: 'act-35', primary_word: 'Heath Ledger', decoy_easy: 'Christian Bale', decoy_medium: 'Joaquin Phoenix', decoy_hard: 'Jake Gyllenhaal', hint_text: 'Talented actor known for dramatic depth', mirror_group_id: 'actors-group-06' },
    { id: 'act-36', primary_word: 'Joaquin Phoenix', decoy_easy: 'Heath Ledger', decoy_medium: 'Christian Bale', decoy_hard: 'Jake Gyllenhaal', hint_text: 'Brooding actor drawn to complex characters', mirror_group_id: 'actors-group-07' },
    { id: 'act-37', primary_word: 'Jake Gyllenhaal', decoy_easy: 'Joaquin Phoenix', decoy_medium: 'Ryan Gosling', decoy_hard: 'Christian Bale', hint_text: 'Intense actor of dramatic thrillers', mirror_group_id: 'actors-group-07' },
    { id: 'act-38', primary_word: 'Ryan Gosling', decoy_easy: 'Jake Gyllenhaal', decoy_medium: 'Ryan Reynolds', decoy_hard: 'Chris Pine', hint_text: 'Charming actor with brooding indie roles', mirror_group_id: 'actors-group-07' },
    { id: 'act-39', primary_word: 'Ryan Reynolds', decoy_easy: 'Ryan Gosling', decoy_medium: 'Chris Pratt', decoy_hard: 'Hugh Jackman', hint_text: 'Quick-witted actor known for comedic timing', mirror_group_id: 'actors-group-07' },
    { id: 'act-40', primary_word: 'Hugh Jackman', decoy_easy: 'Ryan Reynolds', decoy_medium: 'Chris Hemsworth', decoy_hard: 'Christian Bale', hint_text: 'Versatile star known for superhero role', mirror_group_id: 'actors-group-07' },
    { id: 'act-41', primary_word: 'Samuel L Jackson', decoy_easy: 'Denzel Washington', decoy_medium: 'Morgan Freeman', decoy_hard: 'Laurence Fishburne', hint_text: 'Cool actor with iconic screen presence', mirror_group_id: 'actors-group-08' },
    { id: 'act-42', primary_word: 'Eddie Murphy', decoy_easy: 'Will Smith', decoy_medium: 'Chris Rock', decoy_hard: 'Kevin Hart', hint_text: 'Comedic star turned family film lead', mirror_group_id: 'actors-group-08' },
    { id: 'act-43', primary_word: 'Kevin Hart', decoy_easy: 'Eddie Murphy', decoy_medium: 'Chris Rock', decoy_hard: 'Dwayne Johnson', hint_text: 'Energetic comedian turned movie star', mirror_group_id: 'actors-group-08' },
    { id: 'act-44', primary_word: 'Chris Rock', decoy_easy: 'Eddie Murphy', decoy_medium: 'Kevin Hart', decoy_hard: 'Dave Chappelle', hint_text: 'Sharp comedian with acting career', mirror_group_id: 'actors-group-08' },
    { id: 'act-45', primary_word: 'Dustin Hoffman', decoy_easy: 'Al Pacino', decoy_medium: 'Robert De Niro', decoy_hard: 'Gene Hackman', hint_text: 'Veteran actor of character-driven dramas', mirror_group_id: 'actors-group-08' },
    { id: 'act-46', primary_word: 'Anthony Hopkins', decoy_easy: 'Morgan Freeman', decoy_medium: 'Ian McKellen', decoy_hard: 'Patrick Stewart', hint_text: 'Distinguished British actor of gravitas', mirror_group_id: 'actors-group-09' },
    { id: 'act-47', primary_word: 'Ian McKellen', decoy_easy: 'Anthony Hopkins', decoy_medium: 'Patrick Stewart', decoy_hard: 'Michael Caine', hint_text: 'Knighted actor known for fantasy roles', mirror_group_id: 'actors-group-09' },
    { id: 'act-48', primary_word: 'Michael Caine', decoy_easy: 'Ian McKellen', decoy_medium: 'Anthony Hopkins', decoy_hard: 'Sean Connery', hint_text: 'Veteran British actor with cockney charm', mirror_group_id: 'actors-group-09' },
    { id: 'act-49', primary_word: 'Gary Oldman', decoy_easy: 'Christian Bale', decoy_medium: 'Anthony Hopkins', decoy_hard: 'Michael Caine', hint_text: 'Transformative British character actor', mirror_group_id: 'actors-group-09' },
    { id: 'act-50', primary_word: 'Benedict Cumberbatch', decoy_easy: 'Tom Hiddleston', decoy_medium: 'Eddie Redmayne', decoy_hard: 'Ian McKellen', hint_text: 'Sharp-featured British actor of prestige roles', mirror_group_id: 'actors-group-09' },
    { id: 'act-51', primary_word: 'Tom Hiddleston', decoy_easy: 'Benedict Cumberbatch', decoy_medium: 'Chris Hemsworth', decoy_hard: 'Eddie Redmayne', hint_text: 'Charming British actor known for villain role', mirror_group_id: 'actors-group-10' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PACK 2: Movies
// ─────────────────────────────────────────────────────────────────────────────
const moviesPack: WordPack = {
  id: 'builtin-movies',
  name: 'Movies',
  description: 'Iconic films from every era',
  words: [
    { id: 'mov-01', primary_word: 'Titanic', decoy_easy: 'The Poseidon Adventure', decoy_medium: 'Avatar', decoy_hard: 'The Shawshank Redemption', hint_text: 'A love story set aboard a sinking ship', mirror_group_id: 'movies-blockbusters-01' },
    { id: 'mov-02', primary_word: 'Avatar', decoy_easy: 'Aliens', decoy_medium: 'Star Wars', decoy_hard: 'Titanic', hint_text: 'Set on the planet Pandora with blue-skinned Na\'vi', mirror_group_id: 'movies-blockbusters-01' },
    { id: 'mov-03', primary_word: 'The Dark Knight', decoy_easy: 'Batman Begins', decoy_medium: 'Spider-Man', decoy_hard: 'The Godfather', hint_text: 'Heath Ledger\'s iconic Joker performance', mirror_group_id: 'movies-superhero-01' },
    { id: 'mov-04', primary_word: 'Avengers: Endgame', decoy_easy: 'Avengers: Infinity War', decoy_medium: 'The Dark Knight', decoy_hard: 'Parasite', hint_text: '"I am Iron Man" — the final MCU Avengers film', mirror_group_id: 'movies-superhero-01' },
    { id: 'mov-05', primary_word: 'The Godfather', decoy_easy: 'Goodfellas', decoy_medium: 'Scarface', decoy_hard: 'Toy Story', hint_text: '"I\'m gonna make him an offer he can\'t refuse"', mirror_group_id: 'movies-classics-01' },
    { id: 'mov-06', primary_word: 'Goodfellas', decoy_easy: 'The Godfather', decoy_medium: 'Casino', decoy_hard: 'Inception', hint_text: 'Martin Scorsese mafia film based on a true story', mirror_group_id: 'movies-classics-01' },
    { id: 'mov-07', primary_word: 'Inception', decoy_easy: 'Interstellar', decoy_medium: 'The Matrix', decoy_hard: 'Goodfellas', hint_text: 'A heist thriller set inside people\'s dreams', mirror_group_id: 'movies-mindbending-01' },
    { id: 'mov-08', primary_word: 'Interstellar', decoy_easy: 'Inception', decoy_medium: '2001: A Space Odyssey', decoy_hard: 'The Godfather', hint_text: 'Astronauts travel through a wormhole near Saturn', mirror_group_id: 'movies-mindbending-01' },
    { id: 'mov-09', primary_word: 'The Matrix', decoy_easy: 'Inception', decoy_medium: 'Blade Runner', decoy_hard: 'Home Alone', hint_text: '"The red pill or the blue pill?" — virtual reality thriller', mirror_group_id: 'movies-mindbending-01' },
    { id: 'mov-10', primary_word: 'Toy Story', decoy_easy: 'A Bug\'s Life', decoy_medium: 'Shrek', decoy_hard: 'The Dark Knight', hint_text: 'The first Pixar feature film about sentient toys', mirror_group_id: 'movies-animation-01' },
    { id: 'mov-11', primary_word: 'The Lion King', decoy_easy: 'Bambi', decoy_medium: 'Mulan', decoy_hard: 'Pulp Fiction', hint_text: 'Disney animated film about a prince named Simba', mirror_group_id: 'movies-animation-01' },
    { id: 'mov-12', primary_word: 'Parasite', decoy_easy: 'Snowpiercer', decoy_medium: 'Oldboy', decoy_hard: 'Avengers: Endgame', hint_text: 'First non-English film to win the Oscar for Best Picture', mirror_group_id: 'movies-worldcinema-01' },
    { id: 'mov-13', primary_word: 'Pulp Fiction', decoy_easy: 'Reservoir Dogs', decoy_medium: 'Kill Bill', decoy_hard: 'The Lion King', hint_text: 'Quentin Tarantino\'s non-linear crime anthology', mirror_group_id: 'movies-classics-01' },
    { id: 'mov-14', primary_word: 'Jurassic Park', decoy_easy: 'The Lost World', decoy_medium: 'King Kong', decoy_hard: 'Parasite', hint_text: 'Dinosaurs are brought back to life on an island resort', mirror_group_id: 'movies-blockbusters-01' },
    { id: 'mov-15', primary_word: 'Home Alone', decoy_easy: 'Home Alone 2', decoy_medium: 'Kevin and Perry Go Large', decoy_hard: 'Interstellar', hint_text: 'A boy defends his house from burglars at Christmas', mirror_group_id: 'movies-christmas-01' },
    { id: 'mov-16', primary_word: 'Forrest Gump', decoy_easy: 'Cast Away', decoy_medium: 'Big', decoy_hard: 'The Matrix', hint_text: '"Life is like a box of chocolates"', mirror_group_id: 'movies-classics-01' },
    { id: 'mov-17', primary_word: 'The Shawshank Redemption', decoy_easy: 'The Green Mile', decoy_medium: 'Schindler\'s List', decoy_hard: 'Toy Story', hint_text: 'A man escapes from a corrupt prison after decades', mirror_group_id: 'movies-classics-01' },
    { id: 'mov-18', primary_word: 'Spirited Away', decoy_easy: 'My Neighbor Totoro', decoy_medium: 'Princess Mononoke', decoy_hard: 'Goodfellas', hint_text: 'Miyazaki film about a girl in a spirit bathhouse', mirror_group_id: 'movies-animation-01' },
    { id: 'mov-19', primary_word: 'Get Out', decoy_easy: 'Us', decoy_medium: 'Hereditary', decoy_hard: 'Jurassic Park', hint_text: 'Jordan Peele\'s Oscar-winning horror social thriller', mirror_group_id: 'movies-worldcinema-01' },
    { id: 'mov-20', primary_word: 'Spider-Man: Into the Spider-Verse', decoy_easy: 'Spider-Man: Across the Spider-Verse', decoy_medium: 'The Dark Knight', decoy_hard: 'Spirited Away', hint_text: 'Animated Oscar-winner introducing Miles Morales', mirror_group_id: 'movies-superhero-01' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PACK 3: Anime
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// PACK: Anime
// ─────────────────────────────────────────────────────────────────────────────
const animePack: WordPack = {
  id: 'builtin-anime',
  name: 'Anime',
  description: 'Beloved series and films from Japan',
  words: [
    { id: 'anime-01', primary_word: 'Naruto', decoy_easy: 'Bleach', decoy_medium: 'One Piece', decoy_hard: 'Boruto', hint_text: 'Ninja protagonist with dream of leadership', mirror_group_id: 'anime-group-00' },
    { id: 'anime-02', primary_word: 'One Piece', decoy_easy: 'Naruto', decoy_medium: 'Fairy Tail', decoy_hard: 'Toriko', hint_text: 'Pirate crew chasing legendary treasure', mirror_group_id: 'anime-group-00' },
    { id: 'anime-03', primary_word: 'Bleach', decoy_easy: 'Naruto', decoy_medium: 'Jujutsu Kaisen', decoy_hard: 'Demon Slayer', hint_text: 'Soul reaper battling dark spirits', mirror_group_id: 'anime-group-00' },
    { id: 'anime-04', primary_word: 'Dragon Ball Z', decoy_easy: 'Dragon Ball', decoy_medium: 'One Piece', decoy_hard: 'Dragon Ball Super', hint_text: 'Martial arts saga with power escalation', mirror_group_id: 'anime-group-00' },
    { id: 'anime-05', primary_word: 'Dragon Ball', decoy_easy: 'Dragon Ball Z', decoy_medium: 'Dr Slump', decoy_hard: 'Dragon Ball Super', hint_text: 'Adventure series with martial arts roots', mirror_group_id: 'anime-group-00' },
    { id: 'anime-06', primary_word: 'Attack on Titan', decoy_easy: 'Demon Slayer', decoy_medium: 'Jujutsu Kaisen', decoy_hard: 'Vinland Saga', hint_text: 'Dark series about humanity\'s survival', mirror_group_id: 'anime-group-01' },
    { id: 'anime-07', primary_word: 'Demon Slayer', decoy_easy: 'Attack on Titan', decoy_medium: 'Jujutsu Kaisen', decoy_hard: 'Bleach', hint_text: 'Sword-wielding hero battling monstrous foes', mirror_group_id: 'anime-group-01' },
    { id: 'anime-08', primary_word: 'Jujutsu Kaisen', decoy_easy: 'Demon Slayer', decoy_medium: 'Bleach', decoy_hard: 'Chainsaw Man', hint_text: 'Modern shonen about cursed powers', mirror_group_id: 'anime-group-01' },
    { id: 'anime-09', primary_word: 'Chainsaw Man', decoy_easy: 'Jujutsu Kaisen', decoy_medium: 'Tokyo Ghoul', decoy_hard: 'Attack on Titan', hint_text: 'Dark action series with monstrous transformations', mirror_group_id: 'anime-group-01' },
    { id: 'anime-10', primary_word: 'Tokyo Ghoul', decoy_easy: 'Chainsaw Man', decoy_medium: 'Attack on Titan', decoy_hard: 'Parasyte', hint_text: 'Horror series about hidden monsters among humans', mirror_group_id: 'anime-group-01' },
    { id: 'anime-11', primary_word: 'Death Note', decoy_easy: 'Code Geass', decoy_medium: 'Monster', decoy_hard: 'Steins Gate', hint_text: 'Psychological thriller about a genius outwitting rivals', mirror_group_id: 'anime-group-02' },
    { id: 'anime-12', primary_word: 'Code Geass', decoy_easy: 'Death Note', decoy_medium: 'Mobile Suit Gundam', decoy_hard: 'Attack on Titan', hint_text: 'Mecha series with strategic mastermind lead', mirror_group_id: 'anime-group-02' },
    { id: 'anime-13', primary_word: 'Fullmetal Alchemist', decoy_easy: 'Fullmetal Alchemist Brotherhood', decoy_medium: 'Soul Eater', decoy_hard: 'Attack on Titan', hint_text: 'Dark fantasy about forbidden science', mirror_group_id: 'anime-group-02' },
    { id: 'anime-14', primary_word: 'Fullmetal Alchemist Brotherhood', decoy_easy: 'Fullmetal Alchemist', decoy_medium: 'Attack on Titan', decoy_hard: 'Soul Eater', hint_text: 'Acclaimed remake with deeper story arc', mirror_group_id: 'anime-group-02' },
    { id: 'anime-15', primary_word: 'My Hero Academia', decoy_easy: 'One Punch Man', decoy_medium: 'Mob Psycho 100', decoy_hard: 'Jujutsu Kaisen', hint_text: 'Superhero school with aspiring young heroes', mirror_group_id: 'anime-group-02' },
    { id: 'anime-16', primary_word: 'One Punch Man', decoy_easy: 'My Hero Academia', decoy_medium: 'Mob Psycho 100', decoy_hard: 'Dragon Ball Z', hint_text: 'Comedic take on overpowered hero', mirror_group_id: 'anime-group-03' },
    { id: 'anime-17', primary_word: 'Mob Psycho 100', decoy_easy: 'One Punch Man', decoy_medium: 'My Hero Academia', decoy_hard: 'Jujutsu Kaisen', hint_text: 'Psychic teen hiding immense power', mirror_group_id: 'anime-group-03' },
    { id: 'anime-18', primary_word: 'Hunter x Hunter', decoy_easy: 'Naruto', decoy_medium: 'One Piece', decoy_hard: 'Fairy Tail', hint_text: 'Adventure series with unique power system', mirror_group_id: 'anime-group-03' },
    { id: 'anime-19', primary_word: 'Fairy Tail', decoy_easy: 'Hunter x Hunter', decoy_medium: 'One Piece', decoy_hard: 'Black Clover', hint_text: 'Guild of magical adventurers series', mirror_group_id: 'anime-group-03' },
    { id: 'anime-20', primary_word: 'Black Clover', decoy_easy: 'Fairy Tail', decoy_medium: 'Naruto', decoy_hard: 'My Hero Academia', hint_text: 'Underdog mage aiming for top title', mirror_group_id: 'anime-group-03' },
    { id: 'anime-21', primary_word: 'Sword Art Online', decoy_easy: 'Log Horizon', decoy_medium: 'Overlord', decoy_hard: 'No Game No Life', hint_text: 'Virtual reality game trapped adventure', mirror_group_id: 'anime-group-04' },
    { id: 'anime-22', primary_word: 'Overlord', decoy_easy: 'Sword Art Online', decoy_medium: 'Log Horizon', decoy_hard: 'That Time I Got Reincarnated as a Slime', hint_text: 'Isekai series about overpowered game character', mirror_group_id: 'anime-group-04' },
    { id: 'anime-23', primary_word: 'That Time I Got Reincarnated as a Slime', decoy_easy: 'Overlord', decoy_medium: 'Mushoku Tensei', decoy_hard: 'Konosuba', hint_text: 'Reincarnation fantasy with slow-life power', mirror_group_id: 'anime-group-04' },
    { id: 'anime-24', primary_word: 'Mushoku Tensei', decoy_easy: 'That Time I Got Reincarnated as a Slime', decoy_medium: 'Konosuba', decoy_hard: 'Re:Zero', hint_text: 'Isekai series with second-chance protagonist', mirror_group_id: 'anime-group-04' },
    { id: 'anime-25', primary_word: 'Re:Zero', decoy_easy: 'Mushoku Tensei', decoy_medium: 'Konosuba', decoy_hard: 'Steins Gate', hint_text: 'Isekai series involving repeated timelines', mirror_group_id: 'anime-group-04' },
    { id: 'anime-26', primary_word: 'Konosuba', decoy_easy: 'Re:Zero', decoy_medium: 'Mushoku Tensei', decoy_hard: 'Overlord', hint_text: 'Comedic isekai with dysfunctional adventuring party', mirror_group_id: 'anime-group-05' },
    { id: 'anime-27', primary_word: 'Steins Gate', decoy_easy: 'Death Note', decoy_medium: 'Re:Zero', decoy_hard: 'Erased', hint_text: 'Sci-fi thriller about altering the past', mirror_group_id: 'anime-group-05' },
    { id: 'anime-28', primary_word: 'Erased', decoy_easy: 'Steins Gate', decoy_medium: 'Monster', decoy_hard: 'Death Note', hint_text: 'Mystery series about preventing tragedy', mirror_group_id: 'anime-group-05' },
    { id: 'anime-29', primary_word: 'Monster', decoy_easy: 'Death Note', decoy_medium: 'Erased', decoy_hard: 'Steins Gate', hint_text: 'Psychological thriller following a fugitive doctor', mirror_group_id: 'anime-group-05' },
    { id: 'anime-30', primary_word: 'Cowboy Bebop', decoy_easy: 'Trigun', decoy_medium: 'Samurai Champloo', decoy_hard: 'Space Dandy', hint_text: 'Stylish space bounty hunter series', mirror_group_id: 'anime-group-05' },
    { id: 'anime-31', primary_word: 'Trigun', decoy_easy: 'Cowboy Bebop', decoy_medium: 'Samurai Champloo', decoy_hard: 'Berserk', hint_text: 'Western-style series with pacifist gunslinger', mirror_group_id: 'anime-group-06' },
    { id: 'anime-32', primary_word: 'Samurai Champloo', decoy_easy: 'Cowboy Bebop', decoy_medium: 'Trigun', decoy_hard: 'Rurouni Kenshin', hint_text: 'Stylish samurai road-trip series', mirror_group_id: 'anime-group-06' },
    { id: 'anime-33', primary_word: 'Rurouni Kenshin', decoy_easy: 'Samurai Champloo', decoy_medium: 'Berserk', decoy_hard: 'Vinland Saga', hint_text: 'Wandering swordsman with violent past', mirror_group_id: 'anime-group-06' },
    { id: 'anime-34', primary_word: 'Berserk', decoy_easy: 'Vinland Saga', decoy_medium: 'Rurouni Kenshin', decoy_hard: 'Attack on Titan', hint_text: 'Dark medieval series with brutal violence', mirror_group_id: 'anime-group-06' },
    { id: 'anime-35', primary_word: 'Vinland Saga', decoy_easy: 'Berserk', decoy_medium: 'Attack on Titan', decoy_hard: 'Rurouni Kenshin', hint_text: 'Historical action series about vengeful warrior', mirror_group_id: 'anime-group-06' },
    { id: 'anime-36', primary_word: 'Neon Genesis Evangelion', decoy_easy: 'Mobile Suit Gundam', decoy_medium: 'Code Geass', decoy_hard: 'Attack on Titan', hint_text: 'Mecha series with psychological themes', mirror_group_id: 'anime-group-07' },
    { id: 'anime-37', primary_word: 'Mobile Suit Gundam', decoy_easy: 'Neon Genesis Evangelion', decoy_medium: 'Code Geass', decoy_hard: 'Macross', hint_text: 'Classic mecha franchise about war', mirror_group_id: 'anime-group-07' },
    { id: 'anime-38', primary_word: 'Ghost in the Shell', decoy_easy: 'Neon Genesis Evangelion', decoy_medium: 'Akira', decoy_hard: 'Cowboy Bebop', hint_text: 'Cyberpunk series about identity and technology', mirror_group_id: 'anime-group-07' },
    { id: 'anime-39', primary_word: 'Akira', decoy_easy: 'Ghost in the Shell', decoy_medium: 'Neon Genesis Evangelion', decoy_hard: 'Tokyo Ghoul', hint_text: 'Classic cyberpunk film about psychic power', mirror_group_id: 'anime-group-07' },
    { id: 'anime-40', primary_word: 'Spirited Away', decoy_easy: 'My Neighbor Totoro', decoy_medium: 'Howl\'s Moving Castle', decoy_hard: 'Princess Mononoke', hint_text: 'Whimsical Ghibli film about another world', mirror_group_id: 'anime-group-07' },
    { id: 'anime-41', primary_word: 'Howl\'s Moving Castle', decoy_easy: 'Spirited Away', decoy_medium: 'Princess Mononoke', decoy_hard: 'My Neighbor Totoro', hint_text: 'Ghibli romance with magical curse', mirror_group_id: 'anime-group-08' },
    { id: 'anime-42', primary_word: 'Princess Mononoke', decoy_easy: 'Spirited Away', decoy_medium: 'Howl\'s Moving Castle', decoy_hard: 'Nausicaa', hint_text: 'Ghibli epic about nature versus humanity', mirror_group_id: 'anime-group-08' },
    { id: 'anime-43', primary_word: 'My Neighbor Totoro', decoy_easy: 'Spirited Away', decoy_medium: 'Princess Mononoke', decoy_hard: 'Kiki\'s Delivery Service', hint_text: 'Gentle Ghibli film about childhood wonder', mirror_group_id: 'anime-group-08' },
    { id: 'anime-44', primary_word: 'Kiki\'s Delivery Service', decoy_easy: 'My Neighbor Totoro', decoy_medium: 'Spirited Away', decoy_hard: 'Howl\'s Moving Castle', hint_text: 'Coming-of-age Ghibli film about independence', mirror_group_id: 'anime-group-08' },
    { id: 'anime-45', primary_word: 'Your Name', decoy_easy: 'Weathering With You', decoy_medium: 'A Silent Voice', decoy_hard: '5 Centimeters Per Second', hint_text: 'Emotional romance film about fated connection', mirror_group_id: 'anime-group-08' },
    { id: 'anime-46', primary_word: 'Weathering With You', decoy_easy: 'Your Name', decoy_medium: 'A Silent Voice', decoy_hard: '5 Centimeters Per Second', hint_text: 'Visually stunning romance about changing weather', mirror_group_id: 'anime-group-09' },
    { id: 'anime-47', primary_word: 'A Silent Voice', decoy_easy: 'Your Name', decoy_medium: 'Weathering With You', decoy_hard: 'Clannad', hint_text: 'Emotional drama about guilt and redemption', mirror_group_id: 'anime-group-09' },
    { id: 'anime-48', primary_word: 'Clannad', decoy_easy: 'A Silent Voice', decoy_medium: 'Your Name', decoy_hard: 'Toradora', hint_text: 'Emotional slice-of-life romance series', mirror_group_id: 'anime-group-09' },
    { id: 'anime-49', primary_word: 'Toradora', decoy_easy: 'Clannad', decoy_medium: 'A Silent Voice', decoy_hard: 'Konosuba', hint_text: 'Romantic comedy about mismatched high schoolers', mirror_group_id: 'anime-group-09' },
    { id: 'anime-50', primary_word: 'Haikyuu', decoy_easy: 'Kuroko\'s Basketball', decoy_medium: 'Slam Dunk', decoy_hard: 'Free', hint_text: 'Sports anime about volleyball teamwork', mirror_group_id: 'anime-group-09' },
    { id: 'anime-51', primary_word: 'Slam Dunk', decoy_easy: 'Haikyuu', decoy_medium: 'Kuroko\'s Basketball', decoy_hard: 'Free', hint_text: 'Classic sports anime about basketball rivalry', mirror_group_id: 'anime-group-10' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PACK 4: Food
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// PACK: Food
// ─────────────────────────────────────────────────────────────────────────────
const foodPack: WordPack = {
  id: 'builtin-food',
  name: 'Food',
  description: 'Dishes and ingredients from around the world',
  words: [
    { id: 'food-01', primary_word: 'Pizza', decoy_easy: 'Taco', decoy_medium: 'Flatbread', decoy_hard: 'Calzone', hint_text: 'Cheesy', mirror_group_id: 'food-group-00' },
    { id: 'food-02', primary_word: 'Sushi', decoy_easy: 'Ramen', decoy_medium: 'Poke bowl', decoy_hard: 'Sashimi', hint_text: 'Raw', mirror_group_id: 'food-group-00' },
    { id: 'food-03', primary_word: 'Burger', decoy_easy: 'Hot dog', decoy_medium: 'Sandwich', decoy_hard: 'Slider', hint_text: 'Patty', mirror_group_id: 'food-group-00' },
    { id: 'food-04', primary_word: 'Ice cream', decoy_easy: 'Cake', decoy_medium: 'Sorbet', decoy_hard: 'Gelato', hint_text: 'Creamy', mirror_group_id: 'food-group-00' },
    { id: 'food-05', primary_word: 'Chocolate', decoy_easy: 'Candy', decoy_medium: 'Caramel', decoy_hard: 'Fudge', hint_text: 'Melts', mirror_group_id: 'food-group-00' },
    { id: 'food-06', primary_word: 'Taco', decoy_easy: 'Sandwich', decoy_medium: 'Quesadilla', decoy_hard: 'Burrito', hint_text: 'Wrapped', mirror_group_id: 'food-group-01' },
    { id: 'food-07', primary_word: 'Pasta', decoy_easy: 'Rice', decoy_medium: 'Noodles', decoy_hard: 'Spaghetti', hint_text: 'Boiled', mirror_group_id: 'food-group-01' },
    { id: 'food-08', primary_word: 'Steak', decoy_easy: 'Burger', decoy_medium: 'Roast', decoy_hard: 'Filet', hint_text: 'Grilled', mirror_group_id: 'food-group-01' },
    { id: 'food-09', primary_word: 'Pancake', decoy_easy: 'Toast', decoy_medium: 'Crepe', decoy_hard: 'Waffle', hint_text: 'Syrup', mirror_group_id: 'food-group-01' },
    { id: 'food-10', primary_word: 'Waffle', decoy_easy: 'Donut', decoy_medium: 'Pancake', decoy_hard: 'Crepe', hint_text: 'Batter', mirror_group_id: 'food-group-01' },
    { id: 'food-11', primary_word: 'Bagel', decoy_easy: 'Muffin', decoy_medium: 'Pretzel', decoy_hard: 'Donut', hint_text: 'Ring', mirror_group_id: 'food-group-02' },
    { id: 'food-12', primary_word: 'Croissant', decoy_easy: 'Bagel', decoy_medium: 'Muffin', decoy_hard: 'Danish', hint_text: 'Flaky', mirror_group_id: 'food-group-02' },
    { id: 'food-13', primary_word: 'Donut', decoy_easy: 'Cookie', decoy_medium: 'Muffin', decoy_hard: 'Fritter', hint_text: 'Fried', mirror_group_id: 'food-group-02' },
    { id: 'food-14', primary_word: 'Cupcake', decoy_easy: 'Brownie', decoy_medium: 'Muffin', decoy_hard: 'Cake pop', hint_text: 'Frosted', mirror_group_id: 'food-group-02' },
    { id: 'food-15', primary_word: 'Cookie', decoy_easy: 'Cracker', decoy_medium: 'Biscuit', decoy_hard: 'Shortbread', hint_text: 'Crumbly', mirror_group_id: 'food-group-02' },
    { id: 'food-16', primary_word: 'Pretzel', decoy_easy: 'Popcorn', decoy_medium: 'Cracker', decoy_hard: 'Breadstick', hint_text: 'Salty', mirror_group_id: 'food-group-03' },
    { id: 'food-17', primary_word: 'Popcorn', decoy_easy: 'Pretzel', decoy_medium: 'Chips', decoy_hard: 'Puffed rice', hint_text: 'Puffed', mirror_group_id: 'food-group-03' },
    { id: 'food-18', primary_word: 'Chips', decoy_easy: 'Popcorn', decoy_medium: 'Pretzel', decoy_hard: 'Crackers', hint_text: 'Crunchy', mirror_group_id: 'food-group-03' },
    { id: 'food-19', primary_word: 'Nachos', decoy_easy: 'Chips', decoy_medium: 'Quesadilla', decoy_hard: 'Loaded fries', hint_text: 'Melted', mirror_group_id: 'food-group-03' },
    { id: 'food-20', primary_word: 'Burrito', decoy_easy: 'Taco', decoy_medium: 'Quesadilla', decoy_hard: 'Wrap', hint_text: 'Rolled', mirror_group_id: 'food-group-03' },
    { id: 'food-21', primary_word: 'Quesadilla', decoy_easy: 'Burrito', decoy_medium: 'Taco', decoy_hard: 'Grilled cheese', hint_text: 'Toasted', mirror_group_id: 'food-group-04' },
    { id: 'food-22', primary_word: 'Ramen', decoy_easy: 'Pasta', decoy_medium: 'Pho', decoy_hard: 'Udon', hint_text: 'Broth', mirror_group_id: 'food-group-04' },
    { id: 'food-23', primary_word: 'Noodles', decoy_easy: 'Rice', decoy_medium: 'Pasta', decoy_hard: 'Chow mein', hint_text: 'Wok', mirror_group_id: 'food-group-04' },
    { id: 'food-24', primary_word: 'Dumpling', decoy_easy: 'Spring roll', decoy_medium: 'Wonton', decoy_hard: 'Gyoza', hint_text: 'Steamed', mirror_group_id: 'food-group-04' },
    { id: 'food-25', primary_word: 'Sausage', decoy_easy: 'Bacon', decoy_medium: 'Hot dog', decoy_hard: 'Bratwurst', hint_text: 'Casing', mirror_group_id: 'food-group-04' },
    { id: 'food-26', primary_word: 'Bacon', decoy_easy: 'Sausage', decoy_medium: 'Ham', decoy_hard: 'Pancetta', hint_text: 'Cured', mirror_group_id: 'food-group-05' },
    { id: 'food-27', primary_word: 'Ham', decoy_easy: 'Bacon', decoy_medium: 'Sausage', decoy_hard: 'Prosciutto', hint_text: 'Sliced', mirror_group_id: 'food-group-05' },
    { id: 'food-28', primary_word: 'Cheese', decoy_easy: 'Yogurt', decoy_medium: 'Butter', decoy_hard: 'Paneer', hint_text: 'Curdled', mirror_group_id: 'food-group-05' },
    { id: 'food-29', primary_word: 'Yogurt', decoy_easy: 'Milk', decoy_medium: 'Cheese', decoy_hard: 'Kefir', hint_text: 'Fermented', mirror_group_id: 'food-group-05' },
    { id: 'food-30', primary_word: 'Butter', decoy_easy: 'Cheese', decoy_medium: 'Margarine', decoy_hard: 'Ghee', hint_text: 'Churned', mirror_group_id: 'food-group-05' },
    { id: 'food-31', primary_word: 'Honey', decoy_easy: 'Sugar', decoy_medium: 'Syrup', decoy_hard: 'Agave', hint_text: 'Sticky', mirror_group_id: 'food-group-06' },
    { id: 'food-32', primary_word: 'Jam', decoy_easy: 'Honey', decoy_medium: 'Marmalade', decoy_hard: 'Preserves', hint_text: 'Spread', mirror_group_id: 'food-group-06' },
    { id: 'food-33', primary_word: 'Peanut butter', decoy_easy: 'Jam', decoy_medium: 'Almond butter', decoy_hard: 'Cashew butter', hint_text: 'Nutty', mirror_group_id: 'food-group-06' },
    { id: 'food-34', primary_word: 'Salad', decoy_easy: 'Soup', decoy_medium: 'Slaw', decoy_hard: 'Grain bowl', hint_text: 'Tossed', mirror_group_id: 'food-group-06' },
    { id: 'food-35', primary_word: 'Soup', decoy_easy: 'Salad', decoy_medium: 'Stew', decoy_hard: 'Broth', hint_text: 'Ladled', mirror_group_id: 'food-group-06' },
    { id: 'food-36', primary_word: 'Sandwich', decoy_easy: 'Burger', decoy_medium: 'Wrap', decoy_hard: 'Sub', hint_text: 'Layered', mirror_group_id: 'food-group-07' },
    { id: 'food-37', primary_word: 'Hot dog', decoy_easy: 'Burger', decoy_medium: 'Sausage', decoy_hard: 'Corn dog', hint_text: 'Ballpark', mirror_group_id: 'food-group-07' },
    { id: 'food-38', primary_word: 'Pie', decoy_easy: 'Cake', decoy_medium: 'Tart', decoy_hard: 'Cobbler', hint_text: 'Crust', mirror_group_id: 'food-group-07' },
    { id: 'food-39', primary_word: 'Brownie', decoy_easy: 'Cookie', decoy_medium: 'Cake', decoy_hard: 'Blondie', hint_text: 'Fudgy', mirror_group_id: 'food-group-07' },
    { id: 'food-40', primary_word: 'Muffin', decoy_easy: 'Cupcake', decoy_medium: 'Scone', decoy_hard: 'Quick bread', hint_text: 'Crumb', mirror_group_id: 'food-group-07' },
    { id: 'food-41', primary_word: 'Bread', decoy_easy: 'Bagel', decoy_medium: 'Bun', decoy_hard: 'Roll', hint_text: 'Crusty', mirror_group_id: 'food-group-08' },
    { id: 'food-42', primary_word: 'Toast', decoy_easy: 'Bread', decoy_medium: 'Bagel', decoy_hard: 'Crouton', hint_text: 'Crispy', mirror_group_id: 'food-group-08' },
    { id: 'food-43', primary_word: 'Rice', decoy_easy: 'Pasta', decoy_medium: 'Quinoa', decoy_hard: 'Risotto', hint_text: 'Starchy', mirror_group_id: 'food-group-08' },
    { id: 'food-44', primary_word: 'Curry', decoy_easy: 'Stew', decoy_medium: 'Soup', decoy_hard: 'Masala', hint_text: 'Spiced', mirror_group_id: 'food-group-08' },
    { id: 'food-45', primary_word: 'Omelette', decoy_easy: 'Pancake', decoy_medium: 'Frittata', decoy_hard: 'Scrambled eggs', hint_text: 'Fluffy', mirror_group_id: 'food-group-08' },
    { id: 'food-46', primary_word: 'Scrambled eggs', decoy_easy: 'Omelette', decoy_medium: 'Fried egg', decoy_hard: 'Frittata', hint_text: 'Whisked', mirror_group_id: 'food-group-09' },
    { id: 'food-47', primary_word: 'Fried chicken', decoy_easy: 'Grilled chicken', decoy_medium: 'Chicken tenders', decoy_hard: 'Chicken nuggets', hint_text: 'Breaded', mirror_group_id: 'food-group-09' },
    { id: 'food-48', primary_word: 'Shrimp', decoy_easy: 'Crab', decoy_medium: 'Lobster', decoy_hard: 'Prawn', hint_text: 'Peeled', mirror_group_id: 'food-group-09' },
    { id: 'food-49', primary_word: 'Lobster', decoy_easy: 'Shrimp', decoy_medium: 'Crab', decoy_hard: 'Crayfish', hint_text: 'Clawed', mirror_group_id: 'food-group-09' },
    { id: 'food-50', primary_word: 'Crab', decoy_easy: 'Lobster', decoy_medium: 'Shrimp', decoy_hard: 'Langostino', hint_text: 'Shelled', mirror_group_id: 'food-group-09' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PACK 5: Animals
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// PACK: Animals
// ─────────────────────────────────────────────────────────────────────────────
const animalsPack: WordPack = {
  id: 'builtin-animals',
  name: 'Animals',
  description: 'Wildlife, pets, and creatures great and small',
  words: [
    { id: 'animal-01', primary_word: 'Lion', decoy_easy: 'Zebra', decoy_medium: 'Cheetah', decoy_hard: 'Tiger', hint_text: 'Mane', mirror_group_id: 'animal-group-00' },
    { id: 'animal-02', primary_word: 'Tiger', decoy_easy: 'Elephant', decoy_medium: 'Leopard', decoy_hard: 'Lion', hint_text: 'Roar', mirror_group_id: 'animal-group-00' },
    { id: 'animal-03', primary_word: 'Wolf', decoy_easy: 'Fox', decoy_medium: 'Hyena', decoy_hard: 'Coyote', hint_text: 'Howl', mirror_group_id: 'animal-group-00' },
    { id: 'animal-04', primary_word: 'Fox', decoy_easy: 'Wolf', decoy_medium: 'Jackal', decoy_hard: 'Coyote', hint_text: 'Cunning', mirror_group_id: 'animal-group-00' },
    { id: 'animal-05', primary_word: 'Bear', decoy_easy: 'Panda', decoy_medium: 'Wolf', decoy_hard: 'Grizzly', hint_text: 'Hibernate', mirror_group_id: 'animal-group-00' },
    { id: 'animal-06', primary_word: 'Panda', decoy_easy: 'Koala', decoy_medium: 'Bear', decoy_hard: 'RedPanda', hint_text: 'Bamboo', mirror_group_id: 'animal-group-01' },
    { id: 'animal-07', primary_word: 'Koala', decoy_easy: 'Panda', decoy_medium: 'Sloth', decoy_hard: 'Kangaroo', hint_text: 'Marsupial', mirror_group_id: 'animal-group-01' },
    { id: 'animal-08', primary_word: 'Kangaroo', decoy_easy: 'Koala', decoy_medium: 'Wallaby', decoy_hard: 'Wallaroo', hint_text: 'Pouch', mirror_group_id: 'animal-group-01' },
    { id: 'animal-09', primary_word: 'Elephant', decoy_easy: 'Rhino', decoy_medium: 'Hippo', decoy_hard: 'Mammoth', hint_text: 'Tusks', mirror_group_id: 'animal-group-01' },
    { id: 'animal-10', primary_word: 'Rhino', decoy_easy: 'Elephant', decoy_medium: 'Hippo', decoy_hard: 'Warthog', hint_text: 'Horn', mirror_group_id: 'animal-group-01' },
    { id: 'animal-11', primary_word: 'Hippo', decoy_easy: 'Rhino', decoy_medium: 'Elephant', decoy_hard: 'Crocodile', hint_text: 'Wallow', mirror_group_id: 'animal-group-02' },
    { id: 'animal-12', primary_word: 'Giraffe', decoy_easy: 'Zebra', decoy_medium: 'Camel', decoy_hard: 'Okapi', hint_text: 'Towering', mirror_group_id: 'animal-group-02' },
    { id: 'animal-13', primary_word: 'Zebra', decoy_easy: 'Horse', decoy_medium: 'Giraffe', decoy_hard: 'Donkey', hint_text: 'Striped', mirror_group_id: 'animal-group-02' },
    { id: 'animal-14', primary_word: 'Horse', decoy_easy: 'Donkey', decoy_medium: 'Zebra', decoy_hard: 'Mule', hint_text: 'Gallop', mirror_group_id: 'animal-group-02' },
    { id: 'animal-15', primary_word: 'Donkey', decoy_easy: 'Horse', decoy_medium: 'Mule', decoy_hard: 'Goat', hint_text: 'Stubborn', mirror_group_id: 'animal-group-02' },
    { id: 'animal-16', primary_word: 'Camel', decoy_easy: 'Llama', decoy_medium: 'Horse', decoy_hard: 'Alpaca', hint_text: 'Hump', mirror_group_id: 'animal-group-03' },
    { id: 'animal-17', primary_word: 'Llama', decoy_easy: 'Camel', decoy_medium: 'Alpaca', decoy_hard: 'Goat', hint_text: 'Wool', mirror_group_id: 'animal-group-03' },
    { id: 'animal-18', primary_word: 'Alpaca', decoy_easy: 'Llama', decoy_medium: 'Sheep', decoy_hard: 'Goat', hint_text: 'Fleece', mirror_group_id: 'animal-group-03' },
    { id: 'animal-19', primary_word: 'Sheep', decoy_easy: 'Goat', decoy_medium: 'Alpaca', decoy_hard: 'Ram', hint_text: 'Bleat', mirror_group_id: 'animal-group-03' },
    { id: 'animal-20', primary_word: 'Goat', decoy_easy: 'Sheep', decoy_medium: 'Cow', decoy_hard: 'Ram', hint_text: 'Bleat', mirror_group_id: 'animal-group-03' },
    { id: 'animal-21', primary_word: 'Cow', decoy_easy: 'Bull', decoy_medium: 'Buffalo', decoy_hard: 'Ox', hint_text: 'Graze', mirror_group_id: 'animal-group-04' },
    { id: 'animal-22', primary_word: 'Bull', decoy_easy: 'Cow', decoy_medium: 'Buffalo', decoy_hard: 'Ox', hint_text: 'Horns', mirror_group_id: 'animal-group-04' },
    { id: 'animal-23', primary_word: 'Buffalo', decoy_easy: 'Bison', decoy_medium: 'Cow', decoy_hard: 'Yak', hint_text: 'Herd', mirror_group_id: 'animal-group-04' },
    { id: 'animal-24', primary_word: 'Bison', decoy_easy: 'Buffalo', decoy_medium: 'Yak', decoy_hard: 'Musk ox', hint_text: 'Shaggy', mirror_group_id: 'animal-group-04' },
    { id: 'animal-25', primary_word: 'Pig', decoy_easy: 'Boar', decoy_medium: 'Hog', decoy_hard: 'Warthog', hint_text: 'Snout', mirror_group_id: 'animal-group-04' },
    { id: 'animal-26', primary_word: 'Boar', decoy_easy: 'Pig', decoy_medium: 'Warthog', decoy_hard: 'Hog', hint_text: 'Tusk', mirror_group_id: 'animal-group-05' },
    { id: 'animal-27', primary_word: 'Deer', decoy_easy: 'Elk', decoy_medium: 'Moose', decoy_hard: 'Antelope', hint_text: 'Antlers', mirror_group_id: 'animal-group-05' },
    { id: 'animal-28', primary_word: 'Elk', decoy_easy: 'Deer', decoy_medium: 'Moose', decoy_hard: 'Caribou', hint_text: 'Antlers', mirror_group_id: 'animal-group-05' },
    { id: 'animal-29', primary_word: 'Moose', decoy_easy: 'Elk', decoy_medium: 'Deer', decoy_hard: 'Caribou', hint_text: 'Antlers', mirror_group_id: 'animal-group-05' },
    { id: 'animal-30', primary_word: 'Antelope', decoy_easy: 'Deer', decoy_medium: 'Gazelle', decoy_hard: 'Impala', hint_text: 'Grassland', mirror_group_id: 'animal-group-05' },
    { id: 'animal-31', primary_word: 'Gazelle', decoy_easy: 'Antelope', decoy_medium: 'Impala', decoy_hard: 'Deer', hint_text: 'Swift', mirror_group_id: 'animal-group-06' },
    { id: 'animal-32', primary_word: 'Cheetah', decoy_easy: 'Leopard', decoy_medium: 'Jaguar', decoy_hard: 'Tiger', hint_text: 'Sprint', mirror_group_id: 'animal-group-06' },
    { id: 'animal-33', primary_word: 'Leopard', decoy_easy: 'Jaguar', decoy_medium: 'Cheetah', decoy_hard: 'Panther', hint_text: 'Spots', mirror_group_id: 'animal-group-06' },
    { id: 'animal-34', primary_word: 'Jaguar', decoy_easy: 'Leopard', decoy_medium: 'Panther', decoy_hard: 'Tiger', hint_text: 'Ambush', mirror_group_id: 'animal-group-06' },
    { id: 'animal-35', primary_word: 'Panther', decoy_easy: 'Jaguar', decoy_medium: 'Leopard', decoy_hard: 'Cougar', hint_text: 'Prowl', mirror_group_id: 'animal-group-06' },
    { id: 'animal-36', primary_word: 'Cougar', decoy_easy: 'Panther', decoy_medium: 'Lynx', decoy_hard: 'Bobcat', hint_text: 'Solitary', mirror_group_id: 'animal-group-07' },
    { id: 'animal-37', primary_word: 'Lynx', decoy_easy: 'Cougar', decoy_medium: 'Bobcat', decoy_hard: 'Wildcat', hint_text: 'Tufted', mirror_group_id: 'animal-group-07' },
    { id: 'animal-38', primary_word: 'Bobcat', decoy_easy: 'Lynx', decoy_medium: 'Wildcat', decoy_hard: 'Cougar', hint_text: 'Nocturnal', mirror_group_id: 'animal-group-07' },
    { id: 'animal-39', primary_word: 'Otter', decoy_easy: 'Beaver', decoy_medium: 'Seal', decoy_hard: 'Muskrat', hint_text: 'Aquatic', mirror_group_id: 'animal-group-07' },
    { id: 'animal-40', primary_word: 'Beaver', decoy_easy: 'Otter', decoy_medium: 'Muskrat', decoy_hard: 'Groundhog', hint_text: 'Dam', mirror_group_id: 'animal-group-07' },
    { id: 'animal-41', primary_word: 'Seal', decoy_easy: 'Otter', decoy_medium: 'Walrus', decoy_hard: 'Sea lion', hint_text: 'Flippers', mirror_group_id: 'animal-group-08' },
    { id: 'animal-42', primary_word: 'Walrus', decoy_easy: 'Seal', decoy_medium: 'Sea lion', decoy_hard: 'Elephant seal', hint_text: 'Tusks', mirror_group_id: 'animal-group-08' },
    { id: 'animal-43', primary_word: 'Dolphin', decoy_easy: 'Whale', decoy_medium: 'Porpoise', decoy_hard: 'Orca', hint_text: 'Blowhole', mirror_group_id: 'animal-group-08' },
    { id: 'animal-44', primary_word: 'Whale', decoy_easy: 'Dolphin', decoy_medium: 'Orca', decoy_hard: 'Narwhal', hint_text: 'Blowhole', mirror_group_id: 'animal-group-08' },
    { id: 'animal-45', primary_word: 'Orca', decoy_easy: 'Whale', decoy_medium: 'Dolphin', decoy_hard: 'Shark', hint_text: 'Predator', mirror_group_id: 'animal-group-08' },
    { id: 'animal-46', primary_word: 'Shark', decoy_easy: 'Orca', decoy_medium: 'Barracuda', decoy_hard: 'Dolphin', hint_text: 'Fins', mirror_group_id: 'animal-group-09' },
    { id: 'animal-47', primary_word: 'Octopus', decoy_easy: 'Squid', decoy_medium: 'Jellyfish', decoy_hard: 'Cuttlefish', hint_text: 'Tentacles', mirror_group_id: 'animal-group-09' },
    { id: 'animal-48', primary_word: 'Squid', decoy_easy: 'Octopus', decoy_medium: 'Cuttlefish', decoy_hard: 'Jellyfish', hint_text: 'Ink', mirror_group_id: 'animal-group-09' },
    { id: 'animal-49', primary_word: 'Crocodile', decoy_easy: 'Alligator', decoy_medium: 'Lizard', decoy_hard: 'Caiman', hint_text: 'Snout', mirror_group_id: 'animal-group-09' },
    { id: 'animal-50', primary_word: 'Alligator', decoy_easy: 'Crocodile', decoy_medium: 'Caiman', decoy_hard: 'Lizard', hint_text: 'Jaws', mirror_group_id: 'animal-group-09' },
    { id: 'animal-51', primary_word: 'Eagle', decoy_easy: 'Hawk', decoy_medium: 'Falcon', decoy_hard: 'Owl', hint_text: 'Talons', mirror_group_id: 'animal-group-10' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PACK 7: Indian Movies
// ─────────────────────────────────────────────────────────────────────────────
const indianMoviesPack: WordPack = {
  id: 'builtin-indian-movies',
  name: 'Indian Movies',
  description: 'Iconic Bollywood blockbusters, historical epics, and beloved dramas',
  words: [
    { id: 'indmov-01', primary_word: 'Sholay', decoy_easy: 'Bobby', decoy_medium: 'Zanjeer', decoy_hard: 'Deewaar', hint_text: 'Iconic action drama from the 1970s', mirror_group_id: 'indmov-action-01' },
    { id: 'indmov-02', primary_word: 'Dilwale Dulhania Le Jayenge', decoy_easy: 'Lagaan', decoy_medium: 'Kuch Kuch Hota Hai', decoy_hard: 'Kabhi Khushi Kabhie Gham', hint_text: 'Beloved family romance drama', mirror_group_id: 'indmov-romance-01' },
    { id: 'indmov-03', primary_word: 'Lagaan', decoy_easy: 'Sholay', decoy_medium: 'Chak De India', decoy_hard: 'Dangal', hint_text: 'Underdog sports triumph story', mirror_group_id: 'indmov-sports-01' },
    { id: 'indmov-04', primary_word: '3 Idiots', decoy_easy: 'PK', decoy_medium: 'Andaz Apna Apna', decoy_hard: 'Hera Pheri', hint_text: 'Popular comedy with social message', mirror_group_id: 'indmov-comedy-01' },
    { id: 'indmov-05', primary_word: 'Dangal', decoy_easy: 'Lagaan', decoy_medium: 'Chak De India', decoy_hard: 'Bhaag Milkha Bhaag', hint_text: 'Inspiring true sports biopic', mirror_group_id: 'indmov-sports-01' },
    { id: 'indmov-06', primary_word: 'Baahubali', decoy_easy: 'RRR', decoy_medium: 'Krrish', decoy_hard: 'Koi Mil Gaya', hint_text: 'Larger-than-life action spectacle', mirror_group_id: 'indmov-epic-01' },
    { id: 'indmov-07', primary_word: 'RRR', decoy_easy: 'Baahubali', decoy_medium: 'Dhoom', decoy_hard: 'Don', hint_text: 'Grand action epic with two heroes', mirror_group_id: 'indmov-epic-01' },
    { id: 'indmov-08', primary_word: 'Kabhi Khushi Kabhie Gham', decoy_easy: 'Hum Aapke Hain Koun', decoy_medium: 'Dilwale Dulhania Le Jayenge', decoy_hard: 'Kal Ho Naa Ho', hint_text: 'Emotional family drama with music', mirror_group_id: 'indmov-family-01' },
    { id: 'indmov-09', primary_word: 'Mughal-e-Azam', decoy_easy: 'Jodhaa Akbar', decoy_medium: 'Bajirao Mastani', decoy_hard: 'Padmaavat', hint_text: 'Grand period romance with royalty', mirror_group_id: 'indmov-period-01' },
    { id: 'indmov-10', primary_word: 'Mother India', decoy_easy: 'Deewaar', decoy_medium: 'Sholay', decoy_hard: 'Amar Akbar Anthony', hint_text: 'Classic tale of struggle and sacrifice', mirror_group_id: 'indmov-classic-01' },
    { id: 'indmov-11', primary_word: 'Zanjeer', decoy_easy: 'Sholay', decoy_medium: 'Deewaar', decoy_hard: 'Don', hint_text: 'Gritty action film with tough hero', mirror_group_id: 'indmov-action-01' },
    { id: 'indmov-12', primary_word: 'Deewaar', decoy_easy: 'Zanjeer', decoy_medium: 'Mother India', decoy_hard: 'Amar Akbar Anthony', hint_text: 'Story of brothers on different paths', mirror_group_id: 'indmov-classic-01' },
    { id: 'indmov-13', primary_word: 'Kuch Kuch Hota Hai', decoy_easy: 'Dilwale Dulhania Le Jayenge', decoy_medium: 'Kal Ho Naa Ho', decoy_hard: 'Kabhi Khushi Kabhie Gham', hint_text: 'College romance turned emotional drama', mirror_group_id: 'indmov-romance-01' },
    { id: 'indmov-14', primary_word: 'Hum Aapke Hain Koun', decoy_easy: 'Kabhi Khushi Kabhie Gham', decoy_medium: 'Bobby', decoy_hard: 'Dilwale Dulhania Le Jayenge', hint_text: 'Wedding-centered family entertainer', mirror_group_id: 'indmov-family-01' },
    { id: 'indmov-15', primary_word: 'Gadar', decoy_easy: 'Veer-Zaara', decoy_medium: 'Bajrangi Bhaijaan', decoy_hard: 'Jodhaa Akbar', hint_text: 'Cross-border love and patriotism story', mirror_group_id: 'indmov-drama-01' },
    { id: 'indmov-16', primary_word: 'Bajrangi Bhaijaan', decoy_easy: 'Swades', decoy_medium: 'PK', decoy_hard: 'Gadar', hint_text: 'Heartwarming tale of humanity across borders', mirror_group_id: 'indmov-drama-01' },
    { id: 'indmov-17', primary_word: 'PK', decoy_easy: '3 Idiots', decoy_medium: 'Koi Mil Gaya', decoy_hard: 'Andaz Apna Apna', hint_text: 'Comedy that questions social beliefs', mirror_group_id: 'indmov-comedy-01' },
    { id: 'indmov-18', primary_word: 'Taare Zameen Par', decoy_easy: 'Swades', decoy_medium: 'Queen', decoy_hard: 'Piku', hint_text: 'Touching drama about self-discovery', mirror_group_id: 'indmov-drama-01' },
    { id: 'indmov-19', primary_word: 'Swades', decoy_easy: 'Taare Zameen Par', decoy_medium: 'Bajrangi Bhaijaan', decoy_hard: 'Rang De Basanti', hint_text: 'Story of returning to one\'s roots', mirror_group_id: 'indmov-drama-01' },
    { id: 'indmov-20', primary_word: 'Chak De India', decoy_easy: 'Dangal', decoy_medium: 'Lagaan', decoy_hard: 'Bhaag Milkha Bhaag', hint_text: 'Sports drama about overcoming odds', mirror_group_id: 'indmov-sports-01' },
    { id: 'indmov-21', primary_word: 'Rang De Basanti', decoy_easy: 'Swades', decoy_medium: 'Taare Zameen Par', decoy_hard: 'Gully Boy', hint_text: 'Youthful drama with a message', mirror_group_id: 'indmov-drama-01' },
    { id: 'indmov-22', primary_word: 'Om Shanti Om', decoy_easy: 'Devdas', decoy_medium: 'Barfi', decoy_hard: 'Kal Ho Naa Ho', hint_text: 'Nostalgic romance with dramatic twist', mirror_group_id: 'indmov-romance-01' },
    { id: 'indmov-23', primary_word: 'Devdas', decoy_easy: 'Om Shanti Om', decoy_medium: 'Barfi', decoy_hard: 'Bajirao Mastani', hint_text: 'Tragic romance ending in heartbreak', mirror_group_id: 'indmov-romance-01' },
    { id: 'indmov-24', primary_word: 'Bobby', decoy_easy: 'Hum Aapke Hain Koun', decoy_medium: 'Kuch Kuch Hota Hai', decoy_hard: 'Dilwale Dulhania Le Jayenge', hint_text: 'Sweet young love story', mirror_group_id: 'indmov-family-01' },
    { id: 'indmov-25', primary_word: 'Amar Akbar Anthony', decoy_easy: 'Deewaar', decoy_medium: 'Mother India', decoy_hard: 'Zanjeer', hint_text: 'Comedy about separated brothers reunited', mirror_group_id: 'indmov-classic-01' },
    { id: 'indmov-26', primary_word: 'Don', decoy_easy: 'Baazigar', decoy_medium: 'Dhoom', decoy_hard: 'Zanjeer', hint_text: 'Slick thriller about a clever criminal', mirror_group_id: 'indmov-action-01' },
    { id: 'indmov-27', primary_word: 'Andaz Apna Apna', decoy_easy: 'Hera Pheri', decoy_medium: 'Golmaal', decoy_hard: '3 Idiots', hint_text: 'Zany comedy of mistaken identity', mirror_group_id: 'indmov-comedy-01' },
    { id: 'indmov-28', primary_word: 'Hera Pheri', decoy_easy: 'Andaz Apna Apna', decoy_medium: 'Golmaal', decoy_hard: 'Dhoom', hint_text: 'Comedy about a money-making scheme', mirror_group_id: 'indmov-comedy-01' },
    { id: 'indmov-29', primary_word: 'Golmaal', decoy_easy: 'Hera Pheri', decoy_medium: 'Andaz Apna Apna', decoy_hard: 'Dhoom', hint_text: 'Slapstick comedy full of confusion', mirror_group_id: 'indmov-comedy-01' },
    { id: 'indmov-30', primary_word: 'Dhoom', decoy_easy: 'Don', decoy_medium: 'Baazigar', decoy_hard: 'Krrish', hint_text: 'High-speed action about a chase', mirror_group_id: 'indmov-action-01' },
    { id: 'indmov-31', primary_word: 'Krrish', decoy_easy: 'Koi Mil Gaya', decoy_medium: 'Baahubali', decoy_hard: 'RRR', hint_text: 'Superhero adventure with special powers', mirror_group_id: 'indmov-epic-01' },
    { id: 'indmov-32', primary_word: 'Koi Mil Gaya', decoy_easy: 'Krrish', decoy_medium: 'PK', decoy_hard: 'Baahubali', hint_text: 'Sci-fi story involving an outsider', mirror_group_id: 'indmov-epic-01' },
    { id: 'indmov-33', primary_word: 'Barfi', decoy_easy: 'Devdas', decoy_medium: 'Queen', decoy_hard: 'Piku', hint_text: 'Quirky romance told with charm', mirror_group_id: 'indmov-romance-01' },
    { id: 'indmov-34', primary_word: 'Queen', decoy_easy: 'Piku', decoy_medium: 'Barfi', decoy_hard: 'Zindagi Na Milegi Dobara', hint_text: 'Woman\'s journey of self-discovery', mirror_group_id: 'indmov-drama-01' },
    { id: 'indmov-35', primary_word: 'Piku', decoy_easy: 'Queen', decoy_medium: 'Barfi', decoy_hard: 'Taare Zameen Par', hint_text: 'Quirky family drama with humor', mirror_group_id: 'indmov-drama-01' },
    { id: 'indmov-36', primary_word: 'Andhadhun', decoy_easy: 'Drishyam', decoy_medium: 'Talvar', decoy_hard: 'Pink', hint_text: 'Gripping thriller with a twist ending', mirror_group_id: 'indmov-thriller-01' },
    { id: 'indmov-37', primary_word: 'Drishyam', decoy_easy: 'Andhadhun', decoy_medium: 'Talvar', decoy_hard: 'Pink', hint_text: 'Suspense thriller about protecting family', mirror_group_id: 'indmov-thriller-01' },
    { id: 'indmov-38', primary_word: 'Talvar', decoy_easy: 'Drishyam', decoy_medium: 'Andhadhun', decoy_hard: 'Article 15', hint_text: 'Crime thriller based on real case', mirror_group_id: 'indmov-thriller-01' },
    { id: 'indmov-39', primary_word: 'Pink', decoy_easy: 'Article 15', decoy_medium: 'Talvar', decoy_hard: 'Drishyam', hint_text: 'Social drama tackling justice issues', mirror_group_id: 'indmov-thriller-01' },
    { id: 'indmov-40', primary_word: 'Article 15', decoy_easy: 'Pink', decoy_medium: 'Talvar', decoy_hard: 'Gully Boy', hint_text: 'Drama confronting social injustice', mirror_group_id: 'indmov-thriller-01' },
    { id: 'indmov-41', primary_word: 'Gully Boy', decoy_easy: 'Rang De Basanti', decoy_medium: 'Article 15', decoy_hard: 'Zindagi Na Milegi Dobara', hint_text: 'Musical drama about chasing dreams', mirror_group_id: 'indmov-drama-01' },
    { id: 'indmov-42', primary_word: 'Zindagi Na Milegi Dobara', decoy_easy: 'Yeh Jawaani Hai Deewani', decoy_medium: 'Queen', decoy_hard: 'Gully Boy', hint_text: 'Friends on a life-changing trip', mirror_group_id: 'indmov-drama-01' },
    { id: 'indmov-43', primary_word: 'Yeh Jawaani Hai Deewani', decoy_easy: 'Zindagi Na Milegi Dobara', decoy_medium: 'Kal Ho Naa Ho', decoy_hard: 'Kuch Kuch Hota Hai', hint_text: 'Youthful romance with travel adventure', mirror_group_id: 'indmov-romance-01' },
    { id: 'indmov-44', primary_word: 'Kal Ho Naa Ho', decoy_easy: 'Kuch Kuch Hota Hai', decoy_medium: 'Devdas', decoy_hard: 'Dilwale Dulhania Le Jayenge', hint_text: 'Romance overshadowed by looming tragedy', mirror_group_id: 'indmov-romance-01' },
    { id: 'indmov-45', primary_word: 'Veer-Zaara', decoy_easy: 'Gadar', decoy_medium: 'Jodhaa Akbar', decoy_hard: 'Bajirao Mastani', hint_text: 'Epic love story across generations', mirror_group_id: 'indmov-romance-01' },
    { id: 'indmov-46', primary_word: 'Jodhaa Akbar', decoy_easy: 'Mughal-e-Azam', decoy_medium: 'Bajirao Mastani', decoy_hard: 'Padmaavat', hint_text: 'Royal romance set in history', mirror_group_id: 'indmov-period-01' },
    { id: 'indmov-47', primary_word: 'Bajirao Mastani', decoy_easy: 'Jodhaa Akbar', decoy_medium: 'Padmaavat', decoy_hard: 'Mughal-e-Azam', hint_text: 'Period drama of forbidden royal love', mirror_group_id: 'indmov-period-01' },
    { id: 'indmov-48', primary_word: 'Padmaavat', decoy_easy: 'Bajirao Mastani', decoy_medium: 'Jodhaa Akbar', decoy_hard: 'Mughal-e-Azam', hint_text: 'Grand historical drama with royalty', mirror_group_id: 'indmov-period-01' },
    { id: 'indmov-49', primary_word: 'Baazigar', decoy_easy: 'Don', decoy_medium: 'Dhoom', decoy_hard: 'Zanjeer', hint_text: 'Thriller with a vengeful hero', mirror_group_id: 'indmov-action-01' },
    { id: 'indmov-50', primary_word: 'Bhaag Milkha Bhaag', decoy_easy: 'Dangal', decoy_medium: 'Chak De India', decoy_hard: 'Lagaan', hint_text: 'Biopic about a sporting legend', mirror_group_id: 'indmov-sports-01' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PACK: Indian Actors
// ─────────────────────────────────────────────────────────────────────────────
const indianActorsPack: WordPack = {
  id: 'builtin-indian-actors',
  name: 'Indian Actors',
  description: 'Iconic stars from Bollywood and regional Indian cinema',
  words: [
    { id: 'indian-01', primary_word: 'Shah Rukh Khan', decoy_easy: 'Akshay Kumar', decoy_medium: 'Aamir Khan', decoy_hard: 'Salman Khan', hint_text: 'Charismatic superstar known as King of romance', mirror_group_id: 'indian-group-00' },
    { id: 'indian-02', primary_word: 'Salman Khan', decoy_easy: 'Akshay Kumar', decoy_medium: 'Shah Rukh Khan', decoy_hard: 'Aamir Khan', hint_text: 'Macho superstar with massive fan following', mirror_group_id: 'indian-group-00' },
    { id: 'indian-03', primary_word: 'Aamir Khan', decoy_easy: 'Shah Rukh Khan', decoy_medium: 'Salman Khan', decoy_hard: 'Hrithik Roshan', hint_text: 'Perfectionist star known for varied roles', mirror_group_id: 'indian-group-00' },
    { id: 'indian-04', primary_word: 'Akshay Kumar', decoy_easy: 'Salman Khan', decoy_medium: 'Ajay Devgn', decoy_hard: 'Sunny Deol', hint_text: 'Action star known for comic timing', mirror_group_id: 'indian-group-00' },
    { id: 'indian-05', primary_word: 'Hrithik Roshan', decoy_easy: 'Aamir Khan', decoy_medium: 'Ranbir Kapoor', decoy_hard: 'Shahid Kapoor', hint_text: 'Handsome star known for dancing skills', mirror_group_id: 'indian-group-00' },
    { id: 'indian-06', primary_word: 'Ranbir Kapoor', decoy_easy: 'Hrithik Roshan', decoy_medium: 'Ranveer Singh', decoy_hard: 'Shahid Kapoor', hint_text: 'Versatile young star from film family', mirror_group_id: 'indian-group-01' },
    { id: 'indian-07', primary_word: 'Ranveer Singh', decoy_easy: 'Ranbir Kapoor', decoy_medium: 'Varun Dhawan', decoy_hard: 'Shahid Kapoor', hint_text: 'Energetic actor known for flamboyant roles', mirror_group_id: 'indian-group-01' },
    { id: 'indian-08', primary_word: 'Ajay Devgn', decoy_easy: 'Akshay Kumar', decoy_medium: 'Sunny Deol', decoy_hard: 'Sanjay Dutt', hint_text: 'Stoic action hero turned director', mirror_group_id: 'indian-group-01' },
    { id: 'indian-09', primary_word: 'Sunny Deol', decoy_easy: 'Ajay Devgn', decoy_medium: 'Akshay Kumar', decoy_hard: 'Sanjay Dutt', hint_text: 'Rugged action star of the nineties', mirror_group_id: 'indian-group-01' },
    { id: 'indian-10', primary_word: 'Sanjay Dutt', decoy_easy: 'Sunny Deol', decoy_medium: 'Ajay Devgn', decoy_hard: 'Jackie Shroff', hint_text: 'Tough-guy actor with dramatic comeback story', mirror_group_id: 'indian-group-01' },
    { id: 'indian-11', primary_word: 'Amitabh Bachchan', decoy_easy: 'Dharmendra', decoy_medium: 'Rajesh Khanna', decoy_hard: 'Vinod Khanna', hint_text: 'Legendary actor known as Bollywood\'s Shahenshah', mirror_group_id: 'indian-group-02' },
    { id: 'indian-12', primary_word: 'Dharmendra', decoy_easy: 'Amitabh Bachchan', decoy_medium: 'Rajesh Khanna', decoy_hard: 'Jeetendra', hint_text: 'Veteran actor from golden era films', mirror_group_id: 'indian-group-02' },
    { id: 'indian-13', primary_word: 'Rajesh Khanna', decoy_easy: 'Dharmendra', decoy_medium: 'Amitabh Bachchan', decoy_hard: 'Jeetendra', hint_text: 'Romantic superstar of the seventies', mirror_group_id: 'indian-group-02' },
    { id: 'indian-14', primary_word: 'Vinod Khanna', decoy_easy: 'Dharmendra', decoy_medium: 'Amitabh Bachchan', decoy_hard: 'Rajesh Khanna', hint_text: 'Suave leading man of classic films', mirror_group_id: 'indian-group-02' },
    { id: 'indian-15', primary_word: 'Jeetendra', decoy_easy: 'Dharmendra', decoy_medium: 'Rajesh Khanna', decoy_hard: 'Mithun Chakraborty', hint_text: 'Dancing star of masala-era films', mirror_group_id: 'indian-group-02' },
    { id: 'indian-16', primary_word: 'Mithun Chakraborty', decoy_easy: 'Jeetendra', decoy_medium: 'Govinda', decoy_hard: 'Sanjay Dutt', hint_text: 'Disco-era star with huge regional following', mirror_group_id: 'indian-group-03' },
    { id: 'indian-17', primary_word: 'Govinda', decoy_easy: 'Mithun Chakraborty', decoy_medium: 'Jeetendra', decoy_hard: 'Anil Kapoor', hint_text: 'Comic hero known for energetic dance moves', mirror_group_id: 'indian-group-03' },
    { id: 'indian-18', primary_word: 'Anil Kapoor', decoy_easy: 'Govinda', decoy_medium: 'Sanjay Dutt', decoy_hard: 'Jackie Shroff', hint_text: 'Evergreen actor with international crossover roles', mirror_group_id: 'indian-group-03' },
    { id: 'indian-19', primary_word: 'Jackie Shroff', decoy_easy: 'Anil Kapoor', decoy_medium: 'Sanjay Dutt', decoy_hard: 'Sunny Deol', hint_text: 'Rugged star with distinct husky voice', mirror_group_id: 'indian-group-03' },
    { id: 'indian-20', primary_word: 'Naseeruddin Shah', decoy_easy: 'Om Puri', decoy_medium: 'Anupam Kher', decoy_hard: 'Irrfan Khan', hint_text: 'Acclaimed actor of parallel cinema', mirror_group_id: 'indian-group-03' },
    { id: 'indian-21', primary_word: 'Om Puri', decoy_easy: 'Naseeruddin Shah', decoy_medium: 'Anupam Kher', decoy_hard: 'Pankaj Kapur', hint_text: 'Respected character actor of serious dramas', mirror_group_id: 'indian-group-04' },
    { id: 'indian-22', primary_word: 'Anupam Kher', decoy_easy: 'Om Puri', decoy_medium: 'Naseeruddin Shah', decoy_hard: 'Boman Irani', hint_text: 'Versatile actor known for prolific career', mirror_group_id: 'indian-group-04' },
    { id: 'indian-23', primary_word: 'Irrfan Khan', decoy_easy: 'Naseeruddin Shah', decoy_medium: 'Manoj Bajpayee', decoy_hard: 'Nawazuddin Siddiqui', hint_text: 'Nuanced actor known for intense performances', mirror_group_id: 'indian-group-04' },
    { id: 'indian-24', primary_word: 'Nawazuddin Siddiqui', decoy_easy: 'Irrfan Khan', decoy_medium: 'Manoj Bajpayee', decoy_hard: 'Rajkummar Rao', hint_text: 'Intense actor known for gritty roles', mirror_group_id: 'indian-group-04' },
    { id: 'indian-25', primary_word: 'Manoj Bajpayee', decoy_easy: 'Irrfan Khan', decoy_medium: 'Nawazuddin Siddiqui', decoy_hard: 'Pankaj Tripathi', hint_text: 'Acclaimed actor of realistic cinema', mirror_group_id: 'indian-group-04' },
    { id: 'indian-26', primary_word: 'Pankaj Tripathi', decoy_easy: 'Manoj Bajpayee', decoy_medium: 'Nawazuddin Siddiqui', decoy_hard: 'Rajkummar Rao', hint_text: 'Character actor known for calm intensity', mirror_group_id: 'indian-group-05' },
    { id: 'indian-27', primary_word: 'Rajkummar Rao', decoy_easy: 'Pankaj Tripathi', decoy_medium: 'Ayushmann Khurrana', decoy_hard: 'Vicky Kaushal', hint_text: 'Young actor known for offbeat roles', mirror_group_id: 'indian-group-05' },
    { id: 'indian-28', primary_word: 'Ayushmann Khurrana', decoy_easy: 'Rajkummar Rao', decoy_medium: 'Vicky Kaushal', decoy_hard: 'Kartik Aaryan', hint_text: 'Actor known for socially relevant films', mirror_group_id: 'indian-group-05' },
    { id: 'indian-29', primary_word: 'Vicky Kaushal', decoy_easy: 'Ayushmann Khurrana', decoy_medium: 'Rajkummar Rao', decoy_hard: 'Sidharth Malhotra', hint_text: 'Rising star known for intense war roles', mirror_group_id: 'indian-group-05' },
    { id: 'indian-30', primary_word: 'Kartik Aaryan', decoy_easy: 'Ayushmann Khurrana', decoy_medium: 'Varun Dhawan', decoy_hard: 'Sidharth Malhotra', hint_text: 'Young star popular with youth audiences', mirror_group_id: 'indian-group-05' },
    { id: 'indian-31', primary_word: 'Varun Dhawan', decoy_easy: 'Ranveer Singh', decoy_medium: 'Kartik Aaryan', decoy_hard: 'Sidharth Malhotra', hint_text: 'Energetic young actor from film family', mirror_group_id: 'indian-group-06' },
    { id: 'indian-32', primary_word: 'Sidharth Malhotra', decoy_easy: 'Varun Dhawan', decoy_medium: 'Vicky Kaushal', decoy_hard: 'Kartik Aaryan', hint_text: 'Chiseled young actor of romantic films', mirror_group_id: 'indian-group-06' },
    { id: 'indian-33', primary_word: 'Shahid Kapoor', decoy_easy: 'Ranbir Kapoor', decoy_medium: 'Hrithik Roshan', decoy_hard: 'Ranveer Singh', hint_text: 'Dancing star known for intense roles', mirror_group_id: 'indian-group-06' },
    { id: 'indian-34', primary_word: 'Saif Ali Khan', decoy_easy: 'Akshay Kumar', decoy_medium: 'Ajay Devgn', decoy_hard: 'Shahid Kapoor', hint_text: 'Suave actor from royal film family', mirror_group_id: 'indian-group-06' },
    { id: 'indian-35', primary_word: 'Abhishek Bachchan', decoy_easy: 'Saif Ali Khan', decoy_medium: 'Ajay Devgn', decoy_hard: 'Sanjay Dutt', hint_text: 'Actor known for father\'s towering legacy', mirror_group_id: 'indian-group-06' },
    { id: 'indian-36', primary_word: 'Rishi Kapoor', decoy_easy: 'Rajesh Khanna', decoy_medium: 'Dharmendra', decoy_hard: 'Amitabh Bachchan', hint_text: 'Charming romantic star of the seventies', mirror_group_id: 'indian-group-07' },
    { id: 'indian-37', primary_word: 'Rajinikanth', decoy_easy: 'Kamal Haasan', decoy_medium: 'Amitabh Bachchan', decoy_hard: 'Vijay', hint_text: 'South superstar with cult-like following', mirror_group_id: 'indian-group-07' },
    { id: 'indian-38', primary_word: 'Kamal Haasan', decoy_easy: 'Rajinikanth', decoy_medium: 'Mammootty', decoy_hard: 'Mohanlal', hint_text: 'Versatile southern star of many disguises', mirror_group_id: 'indian-group-07' },
    { id: 'indian-39', primary_word: 'Mammootty', decoy_easy: 'Kamal Haasan', decoy_medium: 'Mohanlal', decoy_hard: 'Rajinikanth', hint_text: 'Distinguished actor of Malayalam cinema', mirror_group_id: 'indian-group-07' },
    { id: 'indian-40', primary_word: 'Mohanlal', decoy_easy: 'Mammootty', decoy_medium: 'Kamal Haasan', decoy_hard: 'Suriya', hint_text: 'Beloved actor known for effortless naturalism', mirror_group_id: 'indian-group-07' },
    { id: 'indian-41', primary_word: 'Suriya', decoy_easy: 'Mohanlal', decoy_medium: 'Vijay', decoy_hard: 'Dhanush', hint_text: 'Popular Tamil star known for intense roles', mirror_group_id: 'indian-group-08' },
    { id: 'indian-42', primary_word: 'Vijay', decoy_easy: 'Suriya', decoy_medium: 'Rajinikanth', decoy_hard: 'Ajith Kumar', hint_text: 'Mass hero with huge Tamil fanbase', mirror_group_id: 'indian-group-08' },
    { id: 'indian-43', primary_word: 'Ajith Kumar', decoy_easy: 'Vijay', decoy_medium: 'Suriya', decoy_hard: 'Dhanush', hint_text: 'Action star with dedicated fan following', mirror_group_id: 'indian-group-08' },
    { id: 'indian-44', primary_word: 'Dhanush', decoy_easy: 'Suriya', decoy_medium: 'Ajith Kumar', decoy_hard: 'Vijay', hint_text: 'Versatile star known for singing talent', mirror_group_id: 'indian-group-08' },
    { id: 'indian-45', primary_word: 'Prabhas', decoy_easy: 'Rajinikanth', decoy_medium: 'Mahesh Babu', decoy_hard: 'Allu Arjun', hint_text: 'Towering star of epic action films', mirror_group_id: 'indian-group-08' },
    { id: 'indian-46', primary_word: 'Mahesh Babu', decoy_easy: 'Prabhas', decoy_medium: 'Allu Arjun', decoy_hard: 'Pawan Kalyan', hint_text: 'Telugu superstar known as Prince', mirror_group_id: 'indian-group-09' },
    { id: 'indian-47', primary_word: 'Allu Arjun', decoy_easy: 'Mahesh Babu', decoy_medium: 'Prabhas', decoy_hard: 'Pawan Kalyan', hint_text: 'Stylish Telugu star known for dance', mirror_group_id: 'indian-group-09' },
    { id: 'indian-48', primary_word: 'Pawan Kalyan', decoy_easy: 'Allu Arjun', decoy_medium: 'Mahesh Babu', decoy_hard: 'Chiranjeevi', hint_text: 'Charismatic Telugu star turned politician', mirror_group_id: 'indian-group-09' },
    { id: 'indian-49', primary_word: 'Chiranjeevi', decoy_easy: 'Pawan Kalyan', decoy_medium: 'Mahesh Babu', decoy_hard: 'Rajinikanth', hint_text: 'Veteran Telugu megastar of action films', mirror_group_id: 'indian-group-09' },
    { id: 'indian-50', primary_word: 'Yash', decoy_easy: 'Rajinikanth', decoy_medium: 'Prabhas', decoy_hard: 'Sudeep', hint_text: 'Kannada superstar known for pan-India blockbuster', mirror_group_id: 'indian-group-09' },
    { id: 'indian-51', primary_word: 'Sudeep', decoy_easy: 'Yash', decoy_medium: 'Rajinikanth', decoy_hard: 'Darshan', hint_text: 'Kannada star known for action roles', mirror_group_id: 'indian-group-10' },
    { id: 'indian-52', primary_word: 'Nawazuddin Siddiqui', decoy_easy: 'Irrfan Khan', decoy_medium: 'Manoj Bajpayee', decoy_hard: 'Pankaj Tripathi', hint_text: 'Actor from humble roots known for range', mirror_group_id: 'indian-group-10' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PACK: Everyday Objects
// ─────────────────────────────────────────────────────────────────────────────
const everydayObjectsPack: WordPack = {
  id: 'builtin-everyday-objects',
  name: 'Everyday Objects',
  description: 'Common items you interact with every day',
  words: [
    { id: 'everyd-01', primary_word: 'Umbrella', decoy_easy: 'Raincoat', decoy_medium: 'Poncho', decoy_hard: 'Parasol', hint_text: 'Canopy', mirror_group_id: 'everyd-group-00' },
    { id: 'everyd-02', primary_word: 'Wallet', decoy_easy: 'Purse', decoy_medium: 'Backpack', decoy_hard: 'Billfold', hint_text: 'Pocket', mirror_group_id: 'everyd-group-00' },
    { id: 'everyd-03', primary_word: 'Backpack', decoy_easy: 'Suitcase', decoy_medium: 'Purse', decoy_hard: 'Rucksack', hint_text: 'Straps', mirror_group_id: 'everyd-group-00' },
    { id: 'everyd-04', primary_word: 'Suitcase', decoy_easy: 'Backpack', decoy_medium: 'Duffel bag', decoy_hard: 'Trunk', hint_text: 'Wheels', mirror_group_id: 'everyd-group-00' },
    { id: 'everyd-05', primary_word: 'Keychain', decoy_easy: 'Wallet', decoy_medium: 'Lanyard', decoy_hard: 'Keyring', hint_text: 'Ring', mirror_group_id: 'everyd-group-00' },
    { id: 'everyd-06', primary_word: 'Scissors', decoy_easy: 'Knife', decoy_medium: 'Stapler', decoy_hard: 'Shears', hint_text: 'Blades', mirror_group_id: 'everyd-group-01' },
    { id: 'everyd-07', primary_word: 'Stapler', decoy_easy: 'Scissors', decoy_medium: 'Tape dispenser', decoy_hard: 'Hole punch', hint_text: 'Clip', mirror_group_id: 'everyd-group-01' },
    { id: 'everyd-08', primary_word: 'Paperclip', decoy_easy: 'Stapler', decoy_medium: 'Rubber band', decoy_hard: 'Binder clip', hint_text: 'Bend', mirror_group_id: 'everyd-group-01' },
    { id: 'everyd-09', primary_word: 'Notebook', decoy_easy: 'Journal', decoy_medium: 'Planner', decoy_hard: 'Diary', hint_text: 'Pages', mirror_group_id: 'everyd-group-01' },
    { id: 'everyd-10', primary_word: 'Pen', decoy_easy: 'Pencil', decoy_medium: 'Marker', decoy_hard: 'Ballpoint', hint_text: 'Ink', mirror_group_id: 'everyd-group-01' },
    { id: 'everyd-11', primary_word: 'Pencil', decoy_easy: 'Pen', decoy_medium: 'Crayon', decoy_hard: 'Charcoal', hint_text: 'Graphite', mirror_group_id: 'everyd-group-02' },
    { id: 'everyd-12', primary_word: 'Eraser', decoy_easy: 'Pencil', decoy_medium: 'Correction fluid', decoy_hard: 'White-out', hint_text: 'Rubber', mirror_group_id: 'everyd-group-02' },
    { id: 'everyd-13', primary_word: 'Ruler', decoy_easy: 'Tape measure', decoy_medium: 'Yardstick', decoy_hard: 'Meter stick', hint_text: 'Straightedge', mirror_group_id: 'everyd-group-02' },
    { id: 'everyd-14', primary_word: 'Calculator', decoy_easy: 'Computer', decoy_medium: 'Abacus', decoy_hard: 'Adding machine', hint_text: 'Digits', mirror_group_id: 'everyd-group-02' },
    { id: 'everyd-15', primary_word: 'Clock', decoy_easy: 'Watch', decoy_medium: 'Timer', decoy_hard: 'Sundial', hint_text: 'Ticking', mirror_group_id: 'everyd-group-02' },
    { id: 'everyd-16', primary_word: 'Watch', decoy_easy: 'Clock', decoy_medium: 'Bracelet', decoy_hard: 'Fitness tracker', hint_text: 'Wristband', mirror_group_id: 'everyd-group-03' },
    { id: 'everyd-17', primary_word: 'Mirror', decoy_easy: 'Window', decoy_medium: 'Glass', decoy_hard: 'Compact', hint_text: 'Reflection', mirror_group_id: 'everyd-group-03' },
    { id: 'everyd-18', primary_word: 'Candle', decoy_easy: 'Lamp', decoy_medium: 'Flashlight', decoy_hard: 'Lantern', hint_text: 'Wax', mirror_group_id: 'everyd-group-03' },
    { id: 'everyd-19', primary_word: 'Flashlight', decoy_easy: 'Candle', decoy_medium: 'Lantern', decoy_hard: 'Headlamp', hint_text: 'Beam', mirror_group_id: 'everyd-group-03' },
    { id: 'everyd-20', primary_word: 'Lamp', decoy_easy: 'Flashlight', decoy_medium: 'Chandelier', decoy_hard: 'Nightlight', hint_text: 'Bulb', mirror_group_id: 'everyd-group-03' },
    { id: 'everyd-21', primary_word: 'Umbrella stand', decoy_easy: 'Coat rack', decoy_medium: 'Shoe rack', decoy_hard: 'Hat rack', hint_text: 'Entryway', mirror_group_id: 'everyd-group-04' },
    { id: 'everyd-22', primary_word: 'Coat rack', decoy_easy: 'Hanger', decoy_medium: 'Closet', decoy_hard: 'Hook', hint_text: 'Hooks', mirror_group_id: 'everyd-group-04' },
    { id: 'everyd-23', primary_word: 'Hanger', decoy_easy: 'Coat rack', decoy_medium: 'Clothespin', decoy_hard: 'Hook', hint_text: 'Hang', mirror_group_id: 'everyd-group-04' },
    { id: 'everyd-24', primary_word: 'Broom', decoy_easy: 'Mop', decoy_medium: 'Vacuum', decoy_hard: 'Dustpan', hint_text: 'Sweep', mirror_group_id: 'everyd-group-04' },
    { id: 'everyd-25', primary_word: 'Mop', decoy_easy: 'Broom', decoy_medium: 'Sponge', decoy_hard: 'Vacuum', hint_text: 'Bucket', mirror_group_id: 'everyd-group-04' },
    { id: 'everyd-26', primary_word: 'Vacuum', decoy_easy: 'Broom', decoy_medium: 'Mop', decoy_hard: 'Carpet cleaner', hint_text: 'Suction', mirror_group_id: 'everyd-group-05' },
    { id: 'everyd-27', primary_word: 'Sponge', decoy_easy: 'Mop', decoy_medium: 'Rag', decoy_hard: 'Scrub brush', hint_text: 'Absorb', mirror_group_id: 'everyd-group-05' },
    { id: 'everyd-28', primary_word: 'Bucket', decoy_easy: 'Basin', decoy_medium: 'Bin', decoy_hard: 'Pail', hint_text: 'Handle', mirror_group_id: 'everyd-group-05' },
    { id: 'everyd-29', primary_word: 'Trash can', decoy_easy: 'Recycling bin', decoy_medium: 'Bucket', decoy_hard: 'Dumpster', hint_text: 'Lid', mirror_group_id: 'everyd-group-05' },
    { id: 'everyd-30', primary_word: 'Dustpan', decoy_easy: 'Broom', decoy_medium: 'Vacuum', decoy_hard: 'Brush', hint_text: 'Sweep', mirror_group_id: 'everyd-group-05' },
    { id: 'everyd-31', primary_word: 'Toothbrush', decoy_easy: 'Hairbrush', decoy_medium: 'Comb', decoy_hard: 'Razor', hint_text: 'Bristles', mirror_group_id: 'everyd-group-06' },
    { id: 'everyd-32', primary_word: 'Hairbrush', decoy_easy: 'Comb', decoy_medium: 'Toothbrush', decoy_hard: 'Curling iron', hint_text: 'Bristles', mirror_group_id: 'everyd-group-06' },
    { id: 'everyd-33', primary_word: 'Comb', decoy_easy: 'Hairbrush', decoy_medium: 'Razor', decoy_hard: 'Pick', hint_text: 'Teeth', mirror_group_id: 'everyd-group-06' },
    { id: 'everyd-34', primary_word: 'Razor', decoy_easy: 'Scissors', decoy_medium: 'Comb', decoy_hard: 'Shaver', hint_text: 'Blade', mirror_group_id: 'everyd-group-06' },
    { id: 'everyd-35', primary_word: 'Towel', decoy_easy: 'Napkin', decoy_medium: 'Blanket', decoy_hard: 'Washcloth', hint_text: 'Absorb', mirror_group_id: 'everyd-group-06' },
    { id: 'everyd-36', primary_word: 'Napkin', decoy_easy: 'Towel', decoy_medium: 'Tissue', decoy_hard: 'Paper towel', hint_text: 'Wipe', mirror_group_id: 'everyd-group-07' },
    { id: 'everyd-37', primary_word: 'Tissue', decoy_easy: 'Napkin', decoy_medium: 'Toilet paper', decoy_hard: 'Paper towel', hint_text: 'Wipe', mirror_group_id: 'everyd-group-07' },
    { id: 'everyd-38', primary_word: 'Blanket', decoy_easy: 'Towel', decoy_medium: 'Quilt', decoy_hard: 'Sheet', hint_text: 'Cover', mirror_group_id: 'everyd-group-07' },
    { id: 'everyd-39', primary_word: 'Pillow', decoy_easy: 'Cushion', decoy_medium: 'Blanket', decoy_hard: 'Bolster', hint_text: 'Stuff', mirror_group_id: 'everyd-group-07' },
    { id: 'everyd-40', primary_word: 'Cushion', decoy_easy: 'Pillow', decoy_medium: 'Mattress', decoy_hard: 'Rug', hint_text: 'Padding', mirror_group_id: 'everyd-group-07' },
    { id: 'everyd-41', primary_word: 'Rug', decoy_easy: 'Carpet', decoy_medium: 'Mat', decoy_hard: 'Runner', hint_text: 'Floor', mirror_group_id: 'everyd-group-08' },
    { id: 'everyd-42', primary_word: 'Mat', decoy_easy: 'Rug', decoy_medium: 'Doormat', decoy_hard: 'Carpet', hint_text: 'Floor', mirror_group_id: 'everyd-group-08' },
    { id: 'everyd-43', primary_word: 'Curtain', decoy_easy: 'Blinds', decoy_medium: 'Drape', decoy_hard: 'Shade', hint_text: 'Window', mirror_group_id: 'everyd-group-08' },
    { id: 'everyd-44', primary_word: 'Blinds', decoy_easy: 'Curtain', decoy_medium: 'Shade', decoy_hard: 'Shutter', hint_text: 'Window', mirror_group_id: 'everyd-group-08' },
    { id: 'everyd-45', primary_word: 'Doorbell', decoy_easy: 'Buzzer', decoy_medium: 'Knocker', decoy_hard: 'Intercom', hint_text: 'Ring', mirror_group_id: 'everyd-group-08' },
    { id: 'everyd-46', primary_word: 'Doorknob', decoy_easy: 'Handle', decoy_medium: 'Lock', decoy_hard: 'Latch', hint_text: 'Turn', mirror_group_id: 'everyd-group-09' },
    { id: 'everyd-47', primary_word: 'Lock', decoy_easy: 'Padlock', decoy_medium: 'Key', decoy_hard: 'Latch', hint_text: 'Secure', mirror_group_id: 'everyd-group-09' },
    { id: 'everyd-48', primary_word: 'Key', decoy_easy: 'Lock', decoy_medium: 'Keychain', decoy_hard: 'Padlock', hint_text: 'Turn', mirror_group_id: 'everyd-group-09' },
    { id: 'everyd-49', primary_word: 'Padlock', decoy_easy: 'Lock', decoy_medium: 'Key', decoy_hard: 'Chain', hint_text: 'Secure', mirror_group_id: 'everyd-group-09' },
    { id: 'everyd-50', primary_word: 'Hammer', decoy_easy: 'Screwdriver', decoy_medium: 'Wrench', decoy_hard: 'Mallet', hint_text: 'Pound', mirror_group_id: 'everyd-group-09' },
    { id: 'everyd-51', primary_word: 'Screwdriver', decoy_easy: 'Hammer', decoy_medium: 'Wrench', decoy_hard: 'Drill', hint_text: 'Twist', mirror_group_id: 'everyd-group-10' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PACK: Brands and Logos
// ─────────────────────────────────────────────────────────────────────────────
const brandsAndLogosPack: WordPack = {
  id: 'builtin-brands-and-logos',
  name: 'Brands and Logos',
  description: 'Iconic companies, logos, and famous brands',
  words: [
    { id: 'brands-01', primary_word: 'Nike', decoy_easy: 'Reebok', decoy_medium: 'Puma', decoy_hard: 'Adidas', hint_text: 'Stripes', mirror_group_id: 'brands-group-00' },
    { id: 'brands-02', primary_word: 'Adidas', decoy_easy: 'Puma', decoy_medium: 'Nike', decoy_hard: 'New Balance', hint_text: 'Stripes', mirror_group_id: 'brands-group-00' },
    { id: 'brands-03', primary_word: 'McDonald\'s', decoy_easy: 'Burger King', decoy_medium: 'Wendy\'s', decoy_hard: 'Hardee\'s', hint_text: 'Arches', mirror_group_id: 'brands-group-00' },
    { id: 'brands-04', primary_word: 'Burger King', decoy_easy: 'McDonald\'s', decoy_medium: 'KFC', decoy_hard: 'Hardee\'s', hint_text: 'Flame', mirror_group_id: 'brands-group-00' },
    { id: 'brands-05', primary_word: 'Apple', decoy_easy: 'Microsoft', decoy_medium: 'Samsung', decoy_hard: 'IBM', hint_text: 'Bitten', mirror_group_id: 'brands-group-00' },
    { id: 'brands-06', primary_word: 'Samsung', decoy_easy: 'Sony', decoy_medium: 'LG', decoy_hard: 'Panasonic', hint_text: 'Electronics', mirror_group_id: 'brands-group-01' },
    { id: 'brands-07', primary_word: 'Pepsi', decoy_easy: 'Coca-Cola', decoy_medium: 'Dr Pepper', decoy_hard: 'RC Cola', hint_text: 'Cola', mirror_group_id: 'brands-group-01' },
    { id: 'brands-08', primary_word: 'Coca-Cola', decoy_easy: 'Pepsi', decoy_medium: 'Sprite', decoy_hard: 'Fanta', hint_text: 'Cola', mirror_group_id: 'brands-group-01' },
    { id: 'brands-09', primary_word: 'Starbucks', decoy_easy: 'Dunkin\'', decoy_medium: 'Costa Coffee', decoy_hard: 'Peet\'s', hint_text: 'Siren', mirror_group_id: 'brands-group-01' },
    { id: 'brands-10', primary_word: 'Dunkin\'', decoy_easy: 'Starbucks', decoy_medium: 'Tim Hortons', decoy_hard: 'Krispy Kreme', hint_text: 'Donuts', mirror_group_id: 'brands-group-01' },
    { id: 'brands-11', primary_word: 'FedEx', decoy_easy: 'UPS', decoy_medium: 'DHL', decoy_hard: 'USPS', hint_text: 'Arrow', mirror_group_id: 'brands-group-02' },
    { id: 'brands-12', primary_word: 'UPS', decoy_easy: 'FedEx', decoy_medium: 'DHL', decoy_hard: 'USPS', hint_text: 'Brown', mirror_group_id: 'brands-group-02' },
    { id: 'brands-13', primary_word: 'Google', decoy_easy: 'Yahoo', decoy_medium: 'Bing', decoy_hard: 'DuckDuckGo', hint_text: 'Search', mirror_group_id: 'brands-group-02' },
    { id: 'brands-14', primary_word: 'Amazon', decoy_easy: 'eBay', decoy_medium: 'Alibaba', decoy_hard: 'Etsy', hint_text: 'Smile', mirror_group_id: 'brands-group-02' },
    { id: 'brands-15', primary_word: 'Twitter', decoy_easy: 'Facebook', decoy_medium: 'Instagram', decoy_hard: 'Threads', hint_text: 'Bird', mirror_group_id: 'brands-group-02' },
    { id: 'brands-16', primary_word: 'Facebook', decoy_easy: 'Twitter', decoy_medium: 'LinkedIn', decoy_hard: 'Snapchat', hint_text: 'Thumb', mirror_group_id: 'brands-group-03' },
    { id: 'brands-17', primary_word: 'Netflix', decoy_easy: 'Hulu', decoy_medium: 'Disney+', decoy_hard: 'HBO Max', hint_text: 'Streaming', mirror_group_id: 'brands-group-03' },
    { id: 'brands-18', primary_word: 'Disney', decoy_easy: 'Pixar', decoy_medium: 'DreamWorks', decoy_hard: 'Universal', hint_text: 'Castle', mirror_group_id: 'brands-group-03' },
    { id: 'brands-19', primary_word: 'Toyota', decoy_easy: 'Honda', decoy_medium: 'Nissan', decoy_hard: 'Mazda', hint_text: 'Reliable', mirror_group_id: 'brands-group-03' },
    { id: 'brands-20', primary_word: 'Honda', decoy_easy: 'Toyota', decoy_medium: 'Subaru', decoy_hard: 'Mitsubishi', hint_text: 'Engine', mirror_group_id: 'brands-group-03' },
    { id: 'brands-21', primary_word: 'Ford', decoy_easy: 'Chevrolet', decoy_medium: 'Dodge', decoy_hard: 'GMC', hint_text: 'Truck', mirror_group_id: 'brands-group-04' },
    { id: 'brands-22', primary_word: 'Chevrolet', decoy_easy: 'Ford', decoy_medium: 'Buick', decoy_hard: 'Cadillac', hint_text: 'Bowtie', mirror_group_id: 'brands-group-04' },
    { id: 'brands-23', primary_word: 'BMW', decoy_easy: 'Mercedes-Benz', decoy_medium: 'Audi', decoy_hard: 'Lexus', hint_text: 'Luxury', mirror_group_id: 'brands-group-04' },
    { id: 'brands-24', primary_word: 'Mercedes-Benz', decoy_easy: 'BMW', decoy_medium: 'Jaguar', decoy_hard: 'Porsche', hint_text: 'Star', mirror_group_id: 'brands-group-04' },
    { id: 'brands-25', primary_word: 'Mastercard', decoy_easy: 'Visa', decoy_medium: 'American Express', decoy_hard: 'Discover', hint_text: 'Circles', mirror_group_id: 'brands-group-04' },
    { id: 'brands-26', primary_word: 'Visa', decoy_easy: 'Mastercard', decoy_medium: 'American Express', decoy_hard: 'Diners Club', hint_text: 'Card', mirror_group_id: 'brands-group-05' },
    { id: 'brands-27', primary_word: 'Walmart', decoy_easy: 'Target', decoy_medium: 'Costco', decoy_hard: 'Kmart', hint_text: 'Discount', mirror_group_id: 'brands-group-05' },
    { id: 'brands-28', primary_word: 'Target', decoy_easy: 'Walmart', decoy_medium: 'Kohl\'s', decoy_hard: 'Meijer', hint_text: 'Bullseye', mirror_group_id: 'brands-group-05' },
    { id: 'brands-29', primary_word: 'Nintendo', decoy_easy: 'Sony', decoy_medium: 'Sega', decoy_hard: 'Atari', hint_text: 'Console', mirror_group_id: 'brands-group-05' },
    { id: 'brands-30', primary_word: 'PlayStation', decoy_easy: 'Xbox', decoy_medium: 'Nintendo Switch', decoy_hard: 'Sega Genesis', hint_text: 'Controller', mirror_group_id: 'brands-group-05' },
    { id: 'brands-31', primary_word: 'Adobe', decoy_easy: 'Corel', decoy_medium: 'Autodesk', decoy_hard: 'Canva', hint_text: 'Software', mirror_group_id: 'brands-group-06' },
    { id: 'brands-32', primary_word: 'IKEA', decoy_easy: 'Wayfair', decoy_medium: 'Ashley Furniture', decoy_hard: 'Crate & Barrel', hint_text: 'Flatpack', mirror_group_id: 'brands-group-06' },
    { id: 'brands-33', primary_word: 'LEGO', decoy_easy: 'Mega Bloks', decoy_medium: 'Playmobil', decoy_hard: 'K\'Nex', hint_text: 'Brick', mirror_group_id: 'brands-group-06' },
    { id: 'brands-34', primary_word: 'Colgate', decoy_easy: 'Crest', decoy_medium: 'Sensodyne', decoy_hard: 'Aquafresh', hint_text: 'Toothpaste', mirror_group_id: 'brands-group-06' },
    { id: 'brands-35', primary_word: 'Gillette', decoy_easy: 'Schick', decoy_medium: 'Bic', decoy_hard: 'Harry\'s', hint_text: 'Razor', mirror_group_id: 'brands-group-06' },
    { id: 'brands-36', primary_word: 'Kellogg\'s', decoy_easy: 'General Mills', decoy_medium: 'Post', decoy_hard: 'Quaker', hint_text: 'Cereal', mirror_group_id: 'brands-group-07' },
    { id: 'brands-37', primary_word: 'Nestlé', decoy_easy: 'Hershey\'s', decoy_medium: 'Mars', decoy_hard: 'Cadbury', hint_text: 'Chocolate', mirror_group_id: 'brands-group-07' },
    { id: 'brands-38', primary_word: 'Hershey\'s', decoy_easy: 'Nestlé', decoy_medium: 'Ghirardelli', decoy_hard: 'Godiva', hint_text: 'Kiss', mirror_group_id: 'brands-group-07' },
    { id: 'brands-39', primary_word: 'Heinz', decoy_easy: 'Hunt\'s', decoy_medium: 'Del Monte', decoy_hard: 'Campbell\'s', hint_text: 'Ketchup', mirror_group_id: 'brands-group-07' },
    { id: 'brands-40', primary_word: 'Kraft', decoy_easy: 'Heinz', decoy_medium: 'Hellmann\'s', decoy_hard: 'Kraft Foods', hint_text: 'Cheese', mirror_group_id: 'brands-group-07' },
    { id: 'brands-41', primary_word: 'Levi\'s', decoy_easy: 'Wrangler', decoy_medium: 'Lee', decoy_hard: 'Diesel', hint_text: 'Denim', mirror_group_id: 'brands-group-08' },
    { id: 'brands-42', primary_word: 'Gucci', decoy_easy: 'Prada', decoy_medium: 'Louis Vuitton', decoy_hard: 'Versace', hint_text: 'Luxury', mirror_group_id: 'brands-group-08' },
    { id: 'brands-43', primary_word: 'Louis Vuitton', decoy_easy: 'Gucci', decoy_medium: 'Chanel', decoy_hard: 'Hermès', hint_text: 'Monogram', mirror_group_id: 'brands-group-08' },
    { id: 'brands-44', primary_word: 'Chanel', decoy_easy: 'Dior', decoy_medium: 'Louis Vuitton', decoy_hard: 'Yves Saint Laurent', hint_text: 'Perfume', mirror_group_id: 'brands-group-08' },
    { id: 'brands-45', primary_word: 'Rolex', decoy_easy: 'Omega', decoy_medium: 'Cartier', decoy_hard: 'TAG Heuer', hint_text: 'Crown', mirror_group_id: 'brands-group-08' },
    { id: 'brands-46', primary_word: 'Harley-Davidson', decoy_easy: 'Yamaha', decoy_medium: 'Kawasaki', decoy_hard: 'Ducati', hint_text: 'Motorcycle', mirror_group_id: 'brands-group-09' },
    { id: 'brands-47', primary_word: 'Shell', decoy_easy: 'BP', decoy_medium: 'Chevron', decoy_hard: 'ExxonMobil', hint_text: 'Gasoline', mirror_group_id: 'brands-group-09' },
    { id: 'brands-48', primary_word: 'BP', decoy_easy: 'Shell', decoy_medium: 'Exxon', decoy_hard: 'Total', hint_text: 'Petroleum', mirror_group_id: 'brands-group-09' },
    { id: 'brands-49', primary_word: 'Spotify', decoy_easy: 'Apple Music', decoy_medium: 'Tidal', decoy_hard: 'Pandora', hint_text: 'Playlist', mirror_group_id: 'brands-group-09' },
    { id: 'brands-50', primary_word: 'Snapchat', decoy_easy: 'Instagram', decoy_medium: 'TikTok', decoy_hard: 'BeReal', hint_text: 'Ghost', mirror_group_id: 'brands-group-09' },
    { id: 'brands-51', primary_word: 'Uber', decoy_easy: 'Lyft', decoy_medium: 'Grab', decoy_hard: 'Didi', hint_text: 'Rideshare', mirror_group_id: 'brands-group-10' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// All built-in packs export
// ─────────────────────────────────────────────────────────────────────────────
export const BUILTIN_PACKS: WordPack[] = [
  actorsPack,
  moviesPack,
  animePack,
  foodPack,
  animalsPack,
  indianMoviesPack,
  indianActorsPack,
  everydayObjectsPack,
  brandsAndLogosPack,
];

/** Look up a pack by its ID. Returns undefined if not found. */
export function getPackById(id: string): WordPack | undefined {
  return BUILTIN_PACKS.find((p) => p.id === id);
}

/** Get all words from the given pack IDs combined (deduplicated by word id). */
export function getWordsFromPacks(packIds: string[]): WordEntry[] {
  const seen = new Set<string>();
  const words: WordEntry[] = [];
  for (const packId of packIds) {
    const pack = getPackById(packId);
    if (!pack) continue;
    for (const word of pack.words) {
      if (!seen.has(word.id)) {
        seen.add(word.id);
        words.push(word);
      }
    }
  }
  return words;
}
