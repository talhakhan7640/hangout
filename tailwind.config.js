/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
       colors: {
        'support-chat-purple': '#5540C7',
        'support-chat-gray': '#E8E8E8',
        'support-chat-dark': '#151515',
        'support-chat-light': '#FFFFFF',
      },
    },
  },
  plugins: [],
}