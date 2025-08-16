import { create } from 'zustand';

import { toast } from 'react-toastify';
import {debounce} from "@mui/material";
import FoodItemsService from "../../service/food-itemsService.js";

const useSearchStore = create((set) => ({
    searchResults: [],
    searchKeyword: '',
    isSearching: false,
    setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
    searchFoods: debounce(async (keyword) => {
        if (!keyword.trim()) {
            set({ searchResults: [], searchKeyword: '' });
            toast.dismiss(); // Xóa toast khi từ khóa rỗng
            return;
        }
        set({ isSearching: true });
        try {
            const response = await FoodItemsService.searchFoods(keyword);
            set({ isSearching: false });
            if (response.data && response.data.length > 0) {
                set({ searchResults: response.data, searchKeyword: keyword });
            } else {
                set({ searchResults: [], searchKeyword: keyword });
                toast.info('Không tìm thấy món ăn nào!');
            }
        } catch (error) {
            set({ isSearching: false, searchResults: [], searchKeyword: keyword });
            toast.error('Lỗi khi tìm kiếm: ' + (error.response?.data?.message || error.message));
        }
    }, 300), // Trì hoãn 300ms
    clearSearch: () => {
        set({ searchResults: [], searchKeyword: '' });
        toast.dismiss(); // Xóa toast khi reset
    },
    // Cập nhật trạng thái yêu thích của một món ăn trong searchResults
    updateSearchResult: (foodId, newFavoriteStatus) => {
        set((state) => ({
            searchResults: state.searchResults.map(food => 
                food.id === foodId 
                    ? { ...food, favorite: newFavoriteStatus }
                    : food
            )
        }));
    },
}));

export default useSearchStore;