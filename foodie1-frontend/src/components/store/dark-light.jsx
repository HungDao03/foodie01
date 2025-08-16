import { create } from 'zustand';
import { lightTheme, darkTheme } from '../theme/dark-light.js';

const useThemeStore = create((set) => ({
    isDarkMode: localStorage.getItem('theme') === 'dark' || false,
    currentTheme: localStorage.getItem('theme') === 'dark' ? darkTheme : lightTheme,
    toggleTheme: () =>
        set((state) => {
            const newTheme = !state.isDarkMode;
            const themeObject = newTheme ? darkTheme : lightTheme;
            localStorage.setItem('theme', newTheme ? 'dark' : 'light');
            return { 
                isDarkMode: newTheme,
                currentTheme: themeObject
            };
        }),
    setTheme: (isDark) => {
        const themeObject = isDark ? darkTheme : lightTheme;
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        set({ 
            isDarkMode: isDark,
            currentTheme: themeObject
        });
    }
}));

export default useThemeStore;