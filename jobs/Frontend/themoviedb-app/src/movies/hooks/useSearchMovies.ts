import { useEffect, useState } from 'react';
import useLocalStorage from '../../shared/hooks/useLocalStorage';
import LocalStoreUtil from '../../shared/utils/LocalStorageUtil';
import { useLazyGetMoviesBySearchQuery } from '../api/moviesApiSlice';
import { MovieSearchResponse } from '../models/MovieSearchModels';

interface ReturnData {
    searchQuery: string;
    pageNumber: number;
    moviesData: MovieSearchResponse | undefined;
    isLoading: boolean;
    handleSearchQueryChange: (value: string) => void;
    handlePageNumberChange: (value: number) => void;
}

const useSearchMovies = (): ReturnData => {
    const [searchQuery, setSearchQuery] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const { fromMovieDetailsPage, localSearchQuery, localPageNumber } =
        useLocalStorage();

    const [trigger, result] = useLazyGetMoviesBySearchQuery({});
    const { data } = result;

    useEffect(() => {
        // If we came back from movie details page use saved params to show previous data
        if (fromMovieDetailsPage && localSearchQuery && localPageNumber) {
            trigger(
                { searchQuery: localSearchQuery, pageNumber: localPageNumber },
                true
            );
            setSearchQuery(localSearchQuery);
            setPageNumber(localPageNumber);
        }
    }, []);

    useEffect(() => {
        if (fromMovieDetailsPage) {
            return;
        }

        if (searchQuery) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
            LocalStoreUtil.clearAll();
        }

        const debouncer = setTimeout(() => {
            if (searchQuery) {
                trigger({ searchQuery, pageNumber: 1 }, true);
                setPageNumber(1);
                LocalStoreUtil.set('searchQuery', searchQuery);
                LocalStoreUtil.set('pageNumber', 1);
                setIsLoading(false);
            }
        }, 1000);

        return () => {
            clearTimeout(debouncer);
        };
    }, [searchQuery]);

    useEffect(() => {
        if (searchQuery) {
            trigger({ searchQuery, pageNumber }, true);
            LocalStoreUtil.set('searchQuery', searchQuery);
            LocalStoreUtil.set('pageNumber', pageNumber);
        }
    }, [pageNumber]);

    const handleSearchQueryChange = (value: string) => {
        const fromMovieDetailsPage = LocalStoreUtil.get('fromMovieDetailsPage');
        if (fromMovieDetailsPage !== undefined) {
            LocalStoreUtil.remove('fromMovieDetailsPage');
        }

        setSearchQuery(value);
    };

    const handlePageNumberChange = (value: number) => {
        setPageNumber(value);
    };

    return {
        searchQuery,
        pageNumber,
        moviesData: data,
        isLoading,
        handleSearchQueryChange,
        handlePageNumberChange,
    };
};

export default useSearchMovies;