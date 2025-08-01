// Random motivational quotes for the app
export const motivationalQuotes = [
  { text: "Progress, not perfection.", author: "Anonymous" },
  { text: "Small steps every day lead to big changes.", author: "Anonymous" },
  {
    text: "You don't have to be great to get started, but you have to get started to be great.",
    author: "Les Brown",
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Don't put off tomorrow what you can do today.",
    author: "Benjamin Franklin",
  },
  {
    text: "A journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
  },
  { text: "Lower the bar until you succeed.", author: "Humble Habit" },
  { text: "Consistency beats perfection.", author: "Anonymous" },
  {
    text: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe",
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    text: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair",
  },
];

export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
};
