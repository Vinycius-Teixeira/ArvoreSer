document.addEventListener('DOMContentLoaded', () => {

  /**
   * Função que inicializa um carrossel "espelhado" E infinito.
   * @param {string} carouselContainerId - ID do container principal (ex: 'carousel-1-root')
   * @param {string} trackId - ID do trilho (ex: 'carouselImages1')
   * @param {string} indicatorsId - ID dos indicadores (ex: 'indicators1')
   */
  function setupInfiniteCarousel(carouselContainerId, trackId, indicatorsId) {
    
    const carouselContainer = document.getElementById(carouselContainerId);
    const track = document.getElementById(trackId);
    const indicatorsContainer = document.getElementById(indicatorsId);

    if (!carouselContainer || !track || !indicatorsContainer) {
      console.error('Elementos do carrossel não encontrados:', carouselContainerId);
      return;
    }

    let slides = Array.from(track.querySelectorAll('img'));
    let totalRealSlides = slides.length;
    let currentIndex = 0; // Começará no primeiro slide REAL
    let isTransitioning = false; // Flag para evitar cliques duplos

    // --- 1. CLONAGEM ---
    // Clona o primeiro e o último slide real
    const slideToCloneAtEnd = slides[0].cloneNode(true);
    const slideToCloneAtStart = slides[totalRealSlides - 1].cloneNode(true);
    
    // Adiciona os clones ao trilho
    track.appendChild(slideToCloneAtEnd);
    track.insertBefore(slideToCloneAtStart, slides[0]);

    // Atualiza a lista de slides para incluir os clones
    slides = Array.from(track.querySelectorAll('img'));
    let totalSlidesWithClones = slides.length;
    
    // --- Fim da Clonagem ---

    const prevButton = carouselContainer.querySelector('.prev');
    const nextButton = carouselContainer.querySelector('.next');

    // Criar indicadores (APENAS para os slides reais)
    for (let i = 0; i < totalRealSlides; i++) {
      const indicator = document.createElement('div');
      indicator.classList.add('indicator');
      if (i === 0) indicator.classList.add('active');
      // O clique no indicador vai para o slide real (índice 0 a totalRealSlides-1)
      indicator.addEventListener('click', () => goToSlide(i));
      indicatorsContainer.appendChild(indicator);
    }
    const allIndicators = indicatorsContainer.querySelectorAll('.indicator');

    // --- Funções de Lógica ---

    function updateCarousel(index, useTransition = true) {
      if (isTransitioning && useTransition) return; // Previne empilhamento de transições
      isTransitioning = true;

      // 'index' é o índice real (0 a 3, por exemplo)
      // 'slideIndex' é o índice no trilho (incluindo clones)
      let slideIndex = index + 1; // +1 por causa do clone no início
      
      // 1. Aplicar ou remover transição
      track.style.transition = useTransition ? 'transform 0.5s ease-in-out' : 'none';

      // 2. Atualizar classes 'active' (apenas no slide visível)
      slides.forEach(slide => slide.classList.remove('active'));
      slides[slideIndex].classList.add('active');

      // 3. Atualizar indicadores (baseado no índice real, 'index')
      allIndicators.forEach((ind, idx) => {
        ind.classList.toggle('active', idx === index);
      });

      // 4. Calcular o movimento (Efeito Espelhado)
      const activeSlide = slides[slideIndex];
      const viewportCenter = carouselContainer.offsetWidth / 2;
      const slideCenter = activeSlide.offsetLeft + (activeSlide.offsetWidth / 2);
      const offset = viewportCenter - slideCenter;

      track.style.transform = `translateX(${offset}px)`;
    }

    function goToSlide(index) {
      // 'index' aqui é o índice do slide REAL (0 a totalRealSlides - 1)
      
      // Prevenção de loop (se já estiver no slide, não faz nada)
      if (index === currentIndex && isTransitioning) return;
      
      if (index < 0) {
        currentIndex = totalRealSlides - 1; // Ajusta o índice para o último real
      } else if (index >= totalRealSlides) {
        currentIndex = 0; // Ajusta o índice para o primeiro real
      } else {
        currentIndex = index;
      }

      updateCarousel(currentIndex, true);
    }

    // --- Adicionar Eventos ---
    prevButton.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextButton.addEventListener('click', () => goToSlide(currentIndex + 1));
    
    // Opcional: Clicar nos slides (agora precisa ajustar o índice)
    slides.forEach((slide, index) => {
      slide.addEventListener('click', () => {
        // Se for o clone do início (índice 0)
        if (index === 0) {
          goToSlide(totalRealSlides - 1); // Vá para o último real
        // Se for o clone do fim (último índice)
        } else if (index === totalSlidesWithClones - 1) {
          goToSlide(0); // Vá para o primeiro real
        // Se for um slide real (índice - 1)
        } else {
          goToSlide(index - 1); 
        }
      });
    });

    // --- O TRUQUE DO LOOP (EVENTO transitionend) ---
    // Quando a transição CSS terminar...
    track.addEventListener('transitionend', () => {
      isTransitioning = false; // Libera a flag

      // O índice ATUAL é 0 (significa que o slide visível é o 1 real)
      // O slide ANTERIOR era o 3 (o último real)
      // O 'slideIndex' era o 4, que é o [Clone do 1]
      
      // Se o índice atual for o PRIMEIRO real (0) E o slide anterior 
      // foi o ÚLTIMO real (totalRealSlides - 1).
      // Isso é complicado de checar, então checamos o slide ATIVO.
      
      const activeSlideIndexInDOM = currentIndex + 1; // O slide que deveria estar ativo
      
      // Se o slide ativo for o clone do fim (que se parece com o primeiro)
      if (activeSlideIndexInDOM === totalSlidesWithClones - 1) {
        // Salta secretamente para o primeiro slide REAL
        currentIndex = 0;
        updateCarousel(currentIndex, false); // 'false' remove a transição
      }
      
      // Se o slide ativo for o clone do início (que se parece com o último)
      if (activeSlideIndexInDOM === 0) {
        // Salta secretamente para o último slide REAL
        currentIndex = totalRealSlides - 1;
        updateCarousel(currentIndex, false); // 'false' remove a transição
      }
    });

    // Opcional: Timer
    setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 4000);

    // Chamar uma vez no início para centralizar o primeiro item REAL
    // (índice 0, mas com transição falsa para pular para a posição inicial)
    updateCarousel(currentIndex, false);
  }

  // --- Inicialização ---
  // Lembre-se de chamar a função para seus carrosséis:
  setupInfiniteCarousel('carousel-1-root', 'carouselImages1', 'indicators1');
  setupInfiniteCarousel('carousel-2-root', 'carouselImages', 'indicators');

});