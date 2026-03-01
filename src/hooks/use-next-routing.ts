import { useNavigate, useLocation, useParams as useRRParams, useSearchParams as useRRSearchParams } from 'react-router-dom';

export function useRouter() {
    const navigate = useNavigate();
    return {
        push: (path: string) => navigate(path),
        replace: (path: string) => navigate(path, { replace: true }),
        back: () => navigate(-1),
        refresh: () => { window.location.reload(); },
    };
}

export function usePathname() {
    const location = useLocation();
    return location.pathname;
}

export function useSearchParams() {
    const [searchParams] = useRRSearchParams();
    return searchParams;
}

export const useParams = useRRParams;
