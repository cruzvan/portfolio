
export type TranslationKey = 
  | 'pressStart'
  | 'loading'
  | 'menu_about'
  | 'menu_about_cat'
  | 'menu_gd'
  | 'menu_gd_cat'
  | 'menu_ta'
  | 'menu_ta_cat'
  | 'menu_music'
  | 'menu_music_cat'
  | 'menu_extras'
  | 'menu_extras_cat'
  | 'hud_select'
  | 'hud_score'
  | 'back'
  | 'close'
  | 'download_cv_gd'
  | 'download_cv_ta'
  | 'about_role_gd'
  | 'about_role_ta'
  | 'about_bio_p1'
  | 'about_bio_p2'
  | 'get_in_touch'
  | 'autosave_msg'
  | 'saving_notification'
  | 'dont_close'
  | 'external_files'
  | 'responsibilities'
  | 'software'
  | 'duration'
  | 'gallery'
  | 'videos'
  | 'overview'
  | 'all_targets'
  | 'no_videos'
  | 'assets_count'
  | 'cv_header'
  | 'cv_spec_gd'
  | 'cv_spec_ta'
  | 'tech_stack'
  | 'experience'
  | 'education'
  | 'music_desc_01'
  | 'music_desc_02'
  | 'music_desc_03'
  | 'music_desc_04'
  | 'music_desc_05'
  | 'music_desc_06'
  | 'music_desc_07'
  | 'music_desc_08'
  | 'music_desc_09'
  | 'music_desc_10'
  | 'music_desc_11'
  | 'music_desc_12'
  | 'in_progress';

export const translations = {
  en: {
    pressStart: 'Press to start',
    loading: 'Loading Portfolio...',
    menu_about: 'ABOUT ME',
    menu_about_cat: 'PROFILE & CONTACT',
    menu_gd: 'GAME DESIGN',
    menu_gd_cat: 'CORE SKILLS',
    menu_ta: '3D & TECH ART',
    menu_ta_cat: 'VISUALS',
    menu_music: 'MUSIC',
    menu_music_cat: 'AUDIO',
    menu_extras: 'EXTRAS',
    menu_extras_cat: 'EXPERIMENTS',
    hud_select: 'Select',
    hud_score: 'SCORE',
    back: 'Back',
    close: 'Close',
    download_cv_gd: 'CV Game Designer',
    download_cv_ta: 'CV Tech Artist',
    about_role_gd: 'Game Designer',
    about_role_ta: 'Technical Artist',
    about_bio_p1: "World-builder at the intersection of code and art. I am passionate about the process of experimentation: the hours spent refining a mechanic or tweaking a shader until it feels just right.",
    about_bio_p2: "I thrive on teamwork and the constant pursuit of new knowledge to apply to my projects, as I am currently doing at Hollow Flowers. I believe the best games are born from collaboration and meticulous organization.",
    get_in_touch: 'Get in Touch',
    autosave_msg: 'This game has an autosave feature.',
    saving_notification: 'A notification will appear on screen when the game is saving.',
    dont_close: 'Do not close the application during this time.',
    external_files: 'LINK',
    responsibilities: 'Responsibilities',
    software: 'Software',
    duration: 'Duration',
    gallery: 'GALLERY',
    videos: 'VIDEOS',
    overview: 'Overview',
    all_targets: 'All Targets',
    no_videos: 'No video logs available for this project.',
    assets_count: 'Assets',
    cv_header: 'CURRICULUM VITAE',
    cv_spec_gd: 'Specialization: Game Design',
    cv_spec_ta: 'Specialization: Technical Art',
    tech_stack: 'Tech Stack',
    experience: 'Experience',
    education: 'Education',
    music_desc_01: "Frenetic cyberpunk arcade. For the main menu, lowering the BPM and sound aggression to establish the game's safe zone.",
    music_desc_02: "Frenetic cyberpunk arcade. Matches the game's BPM to coincide with rhythmic visuals.",
    music_desc_03: "Prototyped cyberpunk platformer video game. Hopeful, used for scenes following a major obstacle.",
    music_desc_04: "Prototyped cyberpunk platformer video game. Melancholic and introspective.",
    music_desc_05: "Outer space. Awe of the sublime and infinite.",
    music_desc_06: "Rhythm designed for scenes where the user interface is the most relevant element.",
    music_desc_07: "Adds ambience to a narrative where the human being reconnects with themselves after being stranded on an island.",
    music_desc_08: "Designed with the main instruments representing the chase and battle between the mouse and the broom, its eternal enemy.",
    music_desc_09: "After attempting to enter the abandoned castle and getting his foot immobilized, the 'Vagabond King' is no longer so prepared to face his past.",
    music_desc_10: "Characterizing the story's antagonist with Alzheimer's, the piano, section by section, loses the memory of its melody.",
    music_desc_11: "Amidst the fog of defective memory, the old man can recall his beloved and their beautiful little moments together.",
    music_desc_12: "Chiptune for old-school racing game prototyping.",
    in_progress: "In Progress..."
  },
  es: {
    pressStart: 'Presiona para iniciar',
    loading: 'Cargando Portafolio...',
    menu_about: 'SOBRE MÍ',
    menu_about_cat: 'PERFIL Y CONTACTO',
    menu_gd: 'GAME DESIGN',
    menu_gd_cat: 'HABILIDADES CORE',
    menu_ta: '3D Y TECH ART',
    menu_ta_cat: 'VISUALES',
    menu_music: 'MÚSICA',
    menu_music_cat: 'AUDIO',
    menu_extras: 'EXTRAS',
    menu_extras_cat: 'EXPERIMENTOS',
    hud_select: 'Seleccionar',
    hud_score: 'PUNTAJE',
    back: 'Volver',
    close: 'Cerrar',
    download_cv_gd: 'CV Game Designer',
    download_cv_ta: 'CV Tech Artist',
    about_role_gd: 'Diseñador de Juegos',
    about_role_ta: 'Artista Técnico',
    about_bio_p1: "Me defino como un constructor de mundos en la intersección del código y el arte. Me apasiona el proceso de experimentación: las horas dedicadas a perfeccionar una mecánica o a ajustar un shader hasta que se siente perfecto.",
    about_bio_p2: "Disfruto enormemente del trabajo en equipo y la búsqueda constante de nuevos conocimientos para aplicar en mis proyectos, como lo hago actualmente en Hollow Flowers. Creo que los mejores juegos nacen de la colaboración y una meticulosa organización.",
    get_in_touch: 'Contacto',
    autosave_msg: 'Este juego tiene función de autoguardado.',
    saving_notification: 'Aparecerá una notificación en pantalla cuando el juego esté guardando.',
    dont_close: 'No cierres la aplicación durante este tiempo.',
    external_files: 'Enlace',
    responsibilities: 'Responsabilidades',
    software: 'Software',
    duration: 'Duración',
    gallery: 'GALERÍA',
    videos: 'VIDEOS',
    overview: 'Resumen',
    all_targets: 'Todos los Objetivos',
    no_videos: 'No hay registros de video para este proyecto.',
    assets_count: 'Assets',
    cv_header: 'CURRÍCULUM VITAE',
    cv_spec_gd: 'Especialización: Game Design',
    cv_spec_ta: 'Especialización: Technical Art',
    tech_stack: 'Tecnologías',
    experience: 'Experiencia',
    education: 'Educación',
    music_desc_01: "Cyberpunk arcade frenético. Para el main menu, bajando los BPM y la agresividad del sonido para ser la zona segura del juego. ",
    music_desc_02: "Cyberpunk arcade frenético. Va al mismo bpm del juego para coincidir en las visuales rítmicas",
    music_desc_03: "Videojuego de plataformas cyberpunk prototipado. Esperanzador, utilizado para escenas post obstáculo importante.",
    music_desc_04: "Videojuego de plataformas cyberpunk prototipado. Melancólico e instospectivo.",
    music_desc_05: "Espacio exterior. Asombro por lo sublime e infinto",
    music_desc_06: "Ritmo diseñado para escenas donde la interfaz de usuario es lo más relevante.",
    music_desc_07: "Añade ambientación a una narrativa donde el ser humano se reencuentra consigo mismo luego de quedar varado en una isla.",
    music_desc_08: "Diseñado con los instrumentos principales representando la persecusión y batalla entre el ratón y la escoba, su eterna enemiga.",
    music_desc_09: "Luego de querer entrar al castillo abandonado y quedar con su pie inmovilizado, el 'Rey Vagabundo' ya no está tan preparado para enfrentar su pasado.",
    music_desc_10: "Caracterizando al antagoniista de la historia con Alzheimer, el piano sección a sección va perdiendo el recuerdo de su melodía.",
    music_desc_11: "Entre la neblina del defectuoso recuerso, el anciano puede recordar a su amada y sus pequeños hermosos momentos juntos.",
    music_desc_12: "Chiptune de prototipado para videojuegos de carrera old-school.",
    in_progress: "En Proceso..."
  }
};
