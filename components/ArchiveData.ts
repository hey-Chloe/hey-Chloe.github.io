export const archiveObjects = [
  {
    id: 'about',
    label: 'About Chloe',
    href: '/about',
    type: 'paper',
    x: '39%',
    y: '14%',
    w: '25%',
    rotate: '2deg',
    z: 7,
    title: 'Chloe',
    subtitle: 'Who I am / 关于我',
    lines: ['Chloe', 'Java · Web Security · CTF', 'Learning archive', 'GitHub Pages']
  },
  {
    id: 'blog',
    label: 'Blog Notes',
    href: '/blog',
    type: 'paper',
    x: '18%',
    y: '34%',
    w: '28%',
    rotate: '-4deg',
    z: 6,
    title: "CHLOE'S NOTES",
    subtitle: '01 Blog Archive',
    lines: ['Java Notes', 'HTTP Basics', 'SQL Injection', 'XSS', 'Deserialization']
  },
  {
    id: 'projects',
    label: 'Project File',
    href: '/projects',
    type: 'folder',
    x: '48%',
    y: '24%',
    w: '32%',
    rotate: '-1deg',
    z: 3,
    title: 'PROJECT FILE',
    subtitle: '02 Works',
    lines: ['Static Blog', 'Security Notes', 'CTF Writeups', 'Practice Lab']
  },
  {
    id: 'garden',
    label: 'Digital Garden',
    href: '/digital-garden',
    type: 'glass',
    x: '59%',
    y: '48%',
    w: '27%',
    rotate: '7deg',
    z: 8,
    title: 'DIGITAL GARDEN',
    subtitle: '03 Growing Index',
    lines: ['Computer Network', 'Database', 'Operating System', 'Algorithms']
  },
  {
    id: 'media',
    label: 'Media Diary',
    href: '/media-diary',
    type: 'photo',
    x: '10%',
    y: '15%',
    w: '24%',
    rotate: '-1deg',
    z: 4,
    title: 'MEDIA DIARY',
    subtitle: '04 Reading / Watching',
    lines: ['Courses', 'Books', 'Videos', 'References']
  },
  {
    id: 'sketchbook',
    label: 'Sketchbook',
    href: '/sketchbook',
    type: 'small',
    x: '68%',
    y: '68%',
    w: '18%',
    rotate: '-3deg',
    z: 10,
    title: 'SKETCHBOOK',
    subtitle: '05 Visual notes',
    lines: ['Tiny ideas', 'Drafts', 'Screenshots']
  }
];

export const menuItems = [
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
  { href: '/digital-garden', label: 'Garden' },
  { href: '/sketchbook', label: 'Sketchbook' },
  { href: '/friends', label: 'Friends' }
];
