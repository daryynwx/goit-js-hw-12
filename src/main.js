import { getImagesByQuery } from './js/pixabay-api';
import {
    createGallery,
    clearGallery,
    showLoader,
    hideLoader,
    showLoadMoreButton,
    hideLoadMoreButton,
} from './js/render-functions';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

// Виправлений селектор на відповідний клас "form"
const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;
let currentQuery = '';
let totalHits = 0;
const perPage = 15;

form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const query = formData.get('searchQuery').trim();

    if (!query) {
        iziToast.warning({
            message: 'Please enter a search query.',
            position: 'topRight',
        });
        return;
    }

    currentQuery = query;
    currentPage = 1;
    clearGallery();
    hideLoadMoreButton();

    try {
        showLoader();
        const data = await getImagesByQuery(currentQuery, currentPage);
        totalHits = data.totalHits;

        if (data.hits.length === 0) {
            iziToast.info({
                message: 'Sorry, no images found. Please try another query.',
                position: 'topRight',
            });
            return;
        }

        createGallery(data.hits);

        if (totalHits > perPage) {
            showLoadMoreButton();
        } else {
            hideLoadMoreButton();
        }
    } catch (error) {
        iziToast.error({
            message: 'Something went wrong. Please try again later.',
            position: 'topRight',
        });
    } finally {
        hideLoader();
    }
});

loadMoreBtn.addEventListener('click', async () => {
    currentPage += 1;

    try {
        showLoader();
        const data = await getImagesByQuery(currentQuery, currentPage);
        createGallery(data.hits);

        const totalPages = Math.ceil(totalHits / perPage);
        if (currentPage >= totalPages) {
            hideLoadMoreButton();
            iziToast.info({
                message: "We're sorry, but you've reached the end of search results.",
                position: 'topRight',
            });
        }

        smoothScroll();
    } catch (error) {
        iziToast.error({
            message: 'Failed to load more images.',
            position: 'topRight',
        });
    } finally {
        hideLoader();
    }
});

function smoothScroll() {
    const firstCard = document.querySelector('.gallery-item');
    if (!firstCard) return;

    const { height: cardHeight } = firstCard.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
    });
}
