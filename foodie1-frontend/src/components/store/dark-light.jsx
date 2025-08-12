import { create } from 'zustand';

const useThemeStore = create((set) => ({
    isDarkMode: localStorage.getItem('theme') === 'dark' || false,
    toggleTheme: () =>
        set((state) => {
            const newTheme = !state.isDarkMode;
            localStorage.setItem('theme', newTheme ? 'dark' : 'light');
            return { isDarkMode: newTheme };
        }),
}));

export default useThemeStore;