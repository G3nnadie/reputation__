$(document).ready(function () {

  // Header fix
  function mainIndentTop() {
    let headerHieght = $('.header').outerHeight(true);
    $('.main').css('padding-top', headerHieght);
  }
  mainIndentTop();

  $(window).resize(function() {
    mainIndentTop();
  });

  // Open nav
  $('.navbar-toggle').on('click', function () {
    $(this).toggleClass('active');
    $('.nav__box').fadeToggle(200);
    $('.overlay').fadeToggle(200);
  });

  $('.nav__open').on('click', function () {
    $(this).toggleClass('nav__open--active');
    $('.nav__box').fadeToggle(200);
    $('.overlay').fadeToggle(200);
  });

  $('.overlay').mouseup(function (e) {
    let modalContent = $(".nav__box");
    if (!modalContent.is(e.target) && modalContent.has(e.target).length === 0) {
      $('.nav__open').removeClass('nav__open--active');
      $('.navbar-toggle').removeClass('active');
      $('.nav__box').fadeOut(200);
      $(this).fadeOut(200)
    }
  });

  // Open search type
  const fields = document.querySelectorAll('.search__field');

  // Если ни одного .search__field нет — выходим
  if (!fields.length) return;

  // Открытие модалки при клике / фокусе на любом инпуте
  fields.forEach(field => {
    const inputs = field.querySelectorAll('input');
    const popup = field.querySelector('.search__type');

    // Проверяем наличие инпутов и popup внутри данного блока
    if (!inputs.length || !popup) return;

    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        popup.classList.add('search__type--show');
      });

      input.addEventListener('click', () => {
        popup.classList.add('search__type--show');
      });
    });
  });

  // Один глобальный обработчик закрытия
  document.addEventListener('click', (e) => {
    fields.forEach(field => {
      const popup = field.querySelector('.search__type');

      // Если popup отсутствует — пропускаем
      if (!popup) return;

      // Если клик вне данного блока — скрываем
      if (!field.contains(e.target)) {
        popup.classList.remove('search__type--show');
      }
    });
  });

  // P-search__type
  $('.p-search__type a').on('click', function(e) {
    e.preventDefault();

    // определяем индекс внутри своего блока
    const index = $(this).parent().index();

    // снимаем active во всех блоках
    $('.p-search__type a').removeClass('current');

    // добавляем active всем кнопкам с таким же индексом
    $('.p-search__type').each(function() {
        $(this).find('.swiper-slide').eq(index).find('a').addClass('current');
    });
  });

  const header = document.querySelector('.header__scroll-type');
  if (header) {  // выполняем только если элемент есть
      window.addEventListener('scroll', function() {
          if (window.scrollY > 100) {
              header.classList.add('header__scroll-type--show');
          } else {
              header.classList.remove('header__scroll-type--show');
          }
      });
  }

  // Dropdown
  function initMultiSelect(field) {
    const input = field.querySelector("input");
    const clearBtn = field.querySelector(".form__field-clear");
    const dropdown = field.querySelector(".dropdown");
    const checkboxes = field.querySelectorAll(".check__item input");
    const noResults = field.querySelector(".dropdown__no-results");
    let selectedList = null;

    // Открытие dropdown
    input.addEventListener("click", e => {
      e.stopPropagation();
      input.placeholder = "Введите название";

      // Закрываем все остальные dropdown
      document.querySelectorAll(".dropdown").forEach(d => {
        if (d !== dropdown) d.classList.remove("open");
      });

      dropdown.classList.toggle("open");
    });

    // Закрытие dropdown при клике вне
    document.addEventListener("click", e => {
      if (!e.target.closest(".form__field")) {
        document.querySelectorAll(".form__field--check .dropdown").forEach(d => {
          d.classList.remove("open");
        });
      }
    });

    // Кнопка очистки
    clearBtn.addEventListener("click", () => {
      checkboxes.forEach(cb => cb.checked = false);
      removeSelectedList();
      input.value = "";
      input.dataset.searchQuery = "";
      updateDropdownVisibility();
      updateClearButton();
    });

    // Добавление/удаление через чекбоксы
    checkboxes.forEach(cb => {
      cb.addEventListener("change", function () {
        const name = this.closest(".check__item").querySelector(".check__name").textContent;
        if (this.checked) addSelected(name);
        else removeSelected(name);
        updateInputValue();
        updateDropdownVisibility();
      });
    });

    // Добавление выбранного элемента
    function addSelected(name) {
      if (!selectedList) {
        selectedList = document.createElement("ul");
        selectedList.className = "dropdown__selected";
        dropdown.querySelector(".dropdown__wrap").prepend(selectedList);
      }
      if (selectedList.querySelector(`[data-value="${name}"]`)) return;

      const li = document.createElement("li");
      li.className = "dropdown__selected-item";
      li.dataset.value = name;
      li.innerHTML = `${name}<span class="dropdown__selected-remove"></span>`;

      li.querySelector(".dropdown__selected-remove").addEventListener("click", e => {
        e.stopPropagation();
        removeSelected(name);
        const cb = [...checkboxes].find(c => c.closest(".check__item").querySelector(".check__name").textContent === name);
        if (cb) cb.checked = false;
        updateInputValue();
        if (input.value.trim() === "") input.dataset.searchQuery = "";
        updateDropdownVisibility();
      });

      selectedList.appendChild(li);
    }

    // Удаление выбранного элемента
    function removeSelected(name) {
      if (!selectedList) return;
      const item = selectedList.querySelector(`[data-value="${name}"]`);
      if (item) item.remove();
      if (selectedList.children.length === 0) removeSelectedList();
    }

    // Удаление всего списка selectedList
    function removeSelectedList() {
      if (selectedList) {
        selectedList.remove();
        selectedList = null;
      }
    }

    // Обновление значения input
    function updateInputValue() {
      if (!selectedList) {
        input.value = "";
      } else {
        const values = [...selectedList.querySelectorAll("li")].map(li => li.dataset.value);
        input.value = values.join(" ‧ ");
      }
      updateClearButton();
    }

    // Обновление состояния кнопки очистки
    function updateClearButton() {
      if (input.value.trim() !== "") {
        clearBtn.classList.add("active");
      } else {
        clearBtn.classList.remove("active");
      }
    }

    // Ввод текста в input (поиск + синхронизация)
    input.addEventListener("input", e => {
      input.dataset.searchQuery = e.target.value.trim().toLowerCase();
      syncInputWithSelected();
      updateDropdownVisibility();
      updateClearButton();
    });

    // Синхронизация input и selected-list при ручном редактировании
    function syncInputWithSelected() {
      if (!selectedList) return;
      const inputValues = input.value.split(" ‧ ").map(v => v.trim()).filter(v => v);
      [...selectedList.querySelectorAll("li")].forEach(li => {
        if (!inputValues.includes(li.dataset.value)) {
          removeSelected(li.dataset.value);
          const cb = [...checkboxes].find(c => c.closest(".check__item").querySelector(".check__name").textContent === li.dataset.value);
          if (cb) cb.checked = false;
        }
      });
    }

    // Обновление видимости чекбоксов и сообщения "Нет совпадений"
    function updateDropdownVisibility() {
      const query = input.dataset.searchQuery || "";
      let anyVisible = false;

      checkboxes.forEach(cb => {
        const item = cb.closest(".check__item");
        const text = item.querySelector(".check__name").textContent.toLowerCase();
        if (cb.checked || query === "" || text.includes(query)) {
          item.style.display = "";
          anyVisible = true;
        } else {
          item.style.display = "none";
        }
      });

      noResults.style.display = anyVisible ? "none" : "block";
    }
  }

  // Инициализация всех полей на странице
  document.querySelectorAll(".form__field--check").forEach(field => {
    initMultiSelect(field);
  });

  // Select
  function initSingleSelect(field) {
    const input = field.querySelector("input");
    const dropdown = field.querySelector(".dropdown");
    const options = field.querySelectorAll(".select__item input");
    const noResults = field.querySelector(".dropdown__no-results");

    // Открытие dropdown
    input.addEventListener("click", e => {
      e.stopPropagation();

      // Закрываем все другие dropdown на странице
      document.querySelectorAll(".dropdown").forEach(d => {
        if (d !== dropdown) {
          d.classList.remove("open");

          const parent = d.closest(".form__field");
          if (parent) {
            parent.classList.remove("form__field--select-open");
          }
        }
      });

      // Переключение текущего dropdown
      const isOpen = dropdown.classList.toggle("open");
      field.classList.toggle("form__field--select-open", isOpen);
    });

    // Закрытие dropdown при клике вне
    document.addEventListener("click", e => {
      if (!e.target.closest(".form__field")) {
        document.querySelectorAll(".form__field--select").forEach(f => {
          const d = f.querySelector(".dropdown");
          d.classList.remove("open");
          f.classList.remove("form__field--select-open");
        });
      }
    });

    // Выбор радио-кнопки
    options.forEach(option => {
      option.addEventListener("change", function() {
        const value = this.closest(".select__item").querySelector(".select__name").textContent;
        input.value = value;
        dropdown.classList.remove("open"); // закрываем после выбора
        field.classList.remove("form__field--select-open");
        updateNoResults();
      });
    });

    // Фильтр при вводе текста
    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      let anyVisible = false;

      options.forEach(option => {
        const item = option.closest(".select__item");
        const text = item.querySelector(".select__name").textContent.toLowerCase();
        if (text.includes(query)) {
          item.style.display = "";
          anyVisible = true;
        } else {
          item.style.display = "none";
        }
      });

      updateNoResults(anyVisible);
    });

    // Функция обновления блока "Нет совпадений"
    function updateNoResults(anyVisible = true) {
      if (noResults) {
        noResults.style.display = anyVisible ? "none" : "block";
      }
    }

    // Инициалальная проверка
    updateNoResults(true);
  }

  // Инициализация всех одиночных селектов
  document.querySelectorAll(".form__field--select").forEach(field => {
    initSingleSelect(field);
  });

  // Form field arrow
  document.querySelectorAll(".form__field--arrow").forEach((field) => {
    const input = field.querySelector("input");
    const dropdown = field.querySelector(".dropdown");

    // при клике на input
    input.addEventListener("click", () => {
      // проверяем состояние dropdown
      if (dropdown.classList.contains("open")) {
        field.classList.add("form__field--arrow--active");
      } else {
        field.classList.remove("form__field--arrow--active");
      }
    });

    // наблюдаем за изменением класса dropdown (open/не open)
    const observer = new MutationObserver(() => {
      if (dropdown.classList.contains("open")) {
        field.classList.add("form__field--arrow--active");
      } else {
        field.classList.remove("form__field--arrow--active");
      }
    });

    observer.observe(dropdown, { attributes: true, attributeFilter: ["class"] });
  });

  // Fitler more
  $('.filter__inner--more').each(function() {
    const block = $(this);
    const items = block.find('.check__item');
    const btn = block.find('.filter__more a');

    // если чекбоксов больше 5 — скрываем начиная с 6-го
    if (items.length > 5) {
        items.slice(5).addClass('hidden');
    }

    btn.on('click', function(e) {
        e.preventDefault();

        const hiddenItems = items.slice(5);

        if (hiddenItems.hasClass('hidden')) {
            hiddenItems.removeClass('hidden');
            btn.text('Свернуть');
        } else {
            hiddenItems.addClass('hidden');
            btn.text('Показать еще');
        }
    });
  });

  // Fitler more car-body
  $('.filter__inner--body').each(function() {
    const block = $(this);
    const items = block.find('.car-body__item');
    const btn = block.find('.filter__more a');

    // если чекбоксов больше 5 — скрываем начиная с 6-го
    if (items.length > 6) {
        items.slice(6).addClass('hidden');
    }

    btn.on('click', function(e) {
        e.preventDefault();

        const hiddenItems = items.slice(6);

        if (hiddenItems.hasClass('hidden')) {
            hiddenItems.removeClass('hidden');
            btn.text('Свернуть');
        } else {
            hiddenItems.addClass('hidden');
            btn.text('Показать еще');
        }
    });
  });

  // Checkbox list
  $('.check__list > .check__item input[type="checkbox"]').on('change', function() {
    const parentCheck = $(this);
    const container = parentCheck.closest('.check__list');
    const children = container.find('.check__list-inner input[type="checkbox"]');
    const inner = container.find('.check__list-inner');

    // Отмечаем / снимаем детей
    children.prop('checked', parentCheck.is(':checked'));

    // Класс добавляется только один раз
    if (!inner.hasClass('check__list-inner--active')) {
        inner.addClass('check__list-inner--active');
    }
  });

  // Клик по внутренним чекбоксам
  $('.check__list-inner input[type="checkbox"]').on('change', function() {
      const childCheck = $(this);
      const container = childCheck.closest('.check__list');
      const children = container.find('.check__list-inner input[type="checkbox"]');
      const parentCheck = container.find('> .check__item input[type="checkbox"]');

      // Если ВСЕ внутренние выбраны → главный включается
      if (children.length === children.filter(':checked').length) {
          parentCheck.prop('checked', true);
      }
      // Если хотя бы один снят → главный снимается
      else {
          parentCheck.prop('checked', false);
      }
  });

  // Filter Open && Close
  $('.open-filter-btn').on('click', function () {
    $('.filter').addClass('filter--open');
  });

  $('.filter__close').on('click', function () {
    $('.filter').removeClass('filter--open');
  });

  // Tabs
  $('.tab').each(function() {
    let $tab = $(this);
    let $navItems = $tab.find('.tab__nav-item');
    let $items = $tab.find('.tab__item');

    $items.hide().first().show();
    $navItems.first().addClass('active');

    $navItems.on('click', function() {
      let index = $(this).index();

      $navItems.removeClass('active');
      $(this).addClass('active');

      $items.hide().eq(index).fadeIn();
    });
  });

  // Accordion
  $('.accordion').each(function() {
    let $accordion = $(this);

    // ✨ открыть элементы, помеченные как active
    $accordion.find('.accordion__item.active .accordion__body').show();

    $accordion.find('.accordion__head').on('click', function() {
        let $item = $(this).closest('.accordion__item');
        let $body = $item.find('.accordion__body');

        if ($item.hasClass('active')) {
            $item.removeClass('active');
            $body.slideUp(300);
        } else {
            $accordion.find('.accordion__item.active')
                .removeClass('active')
                .find('.accordion__body').slideUp(300);

            $item.addClass('active');
            $body.slideDown(300);
        }
    });
  });

  // Chart
  const canvas = document.getElementById('card-story');
  if (canvas) {
      const ctx = canvas.getContext('2d');

      const myChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: ['2015', '2016', '2017', '2018', '2019', '2020'],
              datasets: [{
                  // label: 'Продажи',
                  data: [0, 30, 60, 9, 120, 65],
                  borderWidth: 2,
                  borderColor: '#94A3B8',
                  backgroundColor: '#64748B',
                  tension: 0.4
              }]
          },
          options: {
              responsive: true,
              scales: {
                x: {
                    ticks: {
                        color: '#94A3B8',
                        font: {
                          weight: '100',
                          size: function() {
                            return window.innerWidth < 768 ? 8 : 16;
                          },
                          family: 'Golos Text'
                        }
                    },
                    grid: {
                      display: false,
                      drawBorder: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94A3B8',
                        font: {
                          weight: '100',
                          size: function() {
                            return window.innerWidth < 768 ? 8 : 16;
                          },
                          family: 'Golos Text'
                        }
                    },
                    border: {
                        display: false
                    },
                    grid: {
                      drawBorder: false,
                      // borderDash: [],
                      // borderColor: '#CBD5E1',
                      // borderWidth: 1,

                      // drawOnChartArea: true,
                      // color: '#CBD5E1',
                      // borderDash: [],
                      // lineWidth: 1,
                      // tickBorderDash: [5, 5],
                  }
                }
              },
              plugins: {
                  legend: {
                      display: false
                  }
              }
          }
      });
  }

  // Anchor link
  $('.anchor-link').on('click', 'a', function(event) {
    event.preventDefault();

    var id  = $(this).attr('href'),
        offset = 60, // отступ сверху в пикселях
        top  = $(id).offset().top - offset;

    $('body,html').animate({scrollTop: top}, 800);
  });

  // P-search type sl
  var swiper = new Swiper(".p-search__type", {
    spaceBetween: 12,
    slidesPerView: 'auto',
    observer: true,
    observeSlideChildren: true,
    observeParents: true,
    breakpoints: {
      768: {
        
      },
    },
  });

  // Aside
  if($(window).width() < 992){
    var swiper = new Swiper(".aside", {
      spaceBetween: 8,
      slidesPerView: 'auto',
      observer: true,
      observeSlideChildren: true,
      observeParents: true,
      breakpoints: {
        768: {
          
        },
      },
    });
  };

});