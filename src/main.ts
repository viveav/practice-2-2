import './styles.css';
import { Book, formatBook, Catalog} from './task1-types';
import { addBook, removeBook, getBook} from './task2-functions';
import { applyFilters, filterByAuthor, filterByMinYear } from './task3-filters';
import { createBookFromForm } from "./task4-integration";
import { filterAndSortBooks, filterByTitle, sortBooks } from './task5-utils';

// ============================================================
// ИСХОДНОЕ СОСТОЯНИЕ (Задание 1)
// ============================================================
const saved = localStorage.getItem('catalog');
let catalog: Catalog = saved 
  ? JSON.parse(saved) 
  : {
      '1': { id: '1', title: 'TypeScript Guide', authors: ['John Doe'], year: 2024 },
      '2': { id: '2', title: 'JavaScript Basics', authors: ['Jane Smith'], year: 2022 },
    };

// ============================================================
// СОХРАНЕНИЕ В localStorage (Задание 1)
// ============================================================
function saveCatalog(): void {
  localStorage.setItem('catalog', JSON.stringify(catalog));
}

// ============================================================
// DOM-элементы
// ============================================================
const bookList = document.querySelector('#bookList') as HTMLDivElement;
const form = document.querySelector('#bookForm') as HTMLFormElement;
const filterBtn = document.querySelector('#applyFilters') as HTMLButtonElement;
const authorInput = document.querySelector('#filterAuthor') as HTMLInputElement;
const yearInput = document.querySelector('#filterYear') as HTMLInputElement;
const errorMessage = document.querySelector('#errorMessage') as HTMLDivElement;

// Получение новых элементов (Задание 2)
const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
const sortBySelect = document.querySelector('#sortBy') as HTMLSelectElement;

// ============================================================
// РЕНДЕРИНГ КАРТОЧЕК
// ============================================================
function renderBooks(books: Book[]) {
  bookList.innerHTML = ''; 

  if (books.length === 0) {
    bookList.textContent = 'Книги не найдены. Попробуйте изменить фильтры.';
    return;
  }

  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = formatBook(book);
    
    const authorsEl = document.createElement('p');
    authorsEl.textContent = `Авторы: ${book.authors.join(', ')}`;
    
    card.append(titleEl, authorsEl);
    
    if (book.year !== undefined) {
      const yearEl = document.createElement('p');
      yearEl.textContent = `Год: ${book.year}`;
      card.append(yearEl);
    }
    if (book.rating !== undefined) {
      const ratingEl = document.createElement('p');
      ratingEl.textContent = `Рейтинг: ${book.rating}`;
      card.append(ratingEl);
    }

    // ============================================================
    // ЗАДАНИЕ 0: КНОПКА «УДАЛИТЬ»
    // ============================================================
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => {
      catalog = removeBook(catalog, book.id);
      saveCatalog();
      update();
    });
    card.append(deleteBtn);
    bookList.append(card);
  });
}

// ============================================================
// ОБРАБОТЧИК ФОРМЫ (ДОБАВЛЕНИЕ КНИГИ)
// ============================================================
form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMessage.textContent = '';
  try {
    const formData = new FormData(form);
    const newBook = createBookFromForm(formData);
    catalog = addBook(catalog, newBook);
    
    saveCatalog();
    
    form.reset();
    update();
  } catch (error) {
    if (error instanceof Error) {   
      errorMessage.textContent = error.message; 
    }
  }
});

// ============================================================
// ОБРАБОТЧИК ФИЛЬТРОВ И СОРТИРОВКИ
// ============================================================
function update() {
  const filters: ((book: Book) => boolean)[] = [];
  
  if (authorInput.value.trim()) {
    filters.push(filterByAuthor(authorInput.value.trim()));
  }
  if (yearInput.value) {
    filters.push(filterByMinYear(parseInt(yearInput.value, 10)));
  }

  const allBooks = Object.values(catalog);
  let filteredBooks = applyFilters(allBooks, filters);
  
  if (searchInput.value.trim()) {
    filteredBooks = filteredBooks.filter(filterByTitle(searchInput.value.trim()));
  }
  
  const sortKey = sortBySelect.value as "rating" | "year";
  renderBooks(sortBooks(filteredBooks, sortKey));
}

filterBtn.addEventListener('click', update);
searchInput.addEventListener('input', update);
sortBySelect.addEventListener('change', update);

update();
