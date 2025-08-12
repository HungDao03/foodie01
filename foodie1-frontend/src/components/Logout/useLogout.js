import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function useLogout() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success('Đăng xuất thành công!');
            navigate('/');
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
            toast.error('Có lỗi xảy ra khi đăng xuất!');
        } finally {
            setIsLoading(false);
        }
    };

    return { handleLogout, isLoading };
} 