import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the initial coordinator snapshot with four root options and the fallback phrase', () => {
    expect(currentPhrase()).toBe('Elegí una opción');
    expect(gridOptionLabels()).toEqual([
      'Me encuentro mal',
      'Necesito algo',
      'Quiero algo',
      'No quiero',
    ]);
    expect(actionButton('Otras opciones').disabled).toBe(false);
  });

  it('confirms visible options, enters child navigation, and renders the derived phrase', () => {
    clickButton('Me encuentro mal');

    expect(currentPhrase()).toBe('Elegí una opción');
    expect(gridOptionLabels()).toEqual(['Me duele', 'Estoy mareado', 'Tengo náuseas']);

    clickButton('Me duele');

    expect(currentPhrase()).toBe('Me duele');
    expect(gridOptionLabels()).toEqual(['Barriga', 'Cabeza']);

    clickButton('Barriga');

    expect(currentPhrase()).toBe('Me duele la barriga');
  });

  it('wires Atrás to restore previous contexts step by step', () => {
    clickButton('Me encuentro mal');
    clickButton('Me duele');

    clickButton('Atrás');

    expect(currentPhrase()).toBe('Elegí una opción');
    expect(gridOptionLabels()).toEqual(['Me duele', 'Estoy mareado', 'Tengo náuseas']);

    clickButton('Atrás');

    expect(currentPhrase()).toBe('Elegí una opción');
    expect(gridOptionLabels()).toEqual([
      'Me encuentro mal',
      'Necesito algo',
      'Quiero algo',
      'No quiero',
    ]);
  });

  it('wires Inicio to reset navigation and clear the phrase', () => {
    clickButton('Me encuentro mal');
    clickButton('Me duele');
    clickButton('Barriga');

    clickButton('Inicio');

    expect(currentPhrase()).toBe('Elegí una opción');
    expect(gridOptionLabels()).toEqual([
      'Me encuentro mal',
      'Necesito algo',
      'Quiero algo',
      'No quiero',
    ]);
  });

  it('wires Otras opciones to root pagination without placing pagination in the grid', () => {
    clickButton('Otras opciones');

    expect(gridOptionLabels()).toEqual(['Emociones', 'Personas', 'Actividades', 'Conversación']);
    expect(gridOptionLabels()).not.toContain('Otras opciones');
    expect(gridOptionLabels()).not.toContain('No encuentro mi opción');
  });

  it('covers RF-016 general vocabulary across paginated root options with health first', () => {
    expect(gridOptionLabels()[0]).toBe('Me encuentro mal');

    clickButton('Otras opciones');

    expect(gridOptionLabels()).toEqual(['Emociones', 'Personas', 'Actividades', 'Conversación']);

    clickButton('Otras opciones');

    expect(gridOptionLabels()).toEqual(['Baño e higiene', 'Ayuda']);
  });

  it('keeps RF-016 nominal categories from emitting incomplete phrases before child selection', () => {
    clickButton('Otras opciones');

    clickButton('Emociones');

    expect(currentPhrase()).toBe('Elegí una opción');
    expect(gridOptionLabels()).toEqual(['Contento', 'Triste']);
  });

  it('renders complete representative phrase paths for RF-016 general categories', () => {
    const cases = [
      {
        pages: 0,
        category: 'Necesito algo',
        children: ['Agua', 'Comer'],
        child: 'Agua',
        phrase: 'Necesito agua',
      },
      {
        pages: 0,
        category: 'Quiero algo',
        children: ['Música', 'Salir'],
        child: 'Música',
        phrase: 'Quiero música',
      },
      {
        pages: 1,
        category: 'Emociones',
        children: ['Contento', 'Triste'],
        child: 'Contento',
        phrase: 'Me siento contento',
      },
      {
        pages: 1,
        category: 'Personas',
        children: ['Mamá', 'Cuidador'],
        child: 'Mamá',
        phrase: 'Quiero ver a mamá',
      },
      {
        pages: 1,
        category: 'Actividades',
        children: ['Jugar', 'Descansar'],
        child: 'Jugar',
        phrase: 'Quiero jugar',
      },
      {
        pages: 1,
        category: 'Conversación',
        children: ['Hola', 'Gracias'],
        child: 'Gracias',
        phrase: 'Quiero decir gracias',
      },
      {
        pages: 2,
        category: 'Baño e higiene',
        children: ['Ir al baño', 'Lavarme las manos'],
        child: 'Ir al baño',
        phrase: 'Necesito ir al baño',
      },
      {
        pages: 2,
        category: 'Ayuda',
        children: ['Moverme', 'Ven aquí'],
        child: 'Moverme',
        phrase: 'Necesito ayuda para moverme',
      },
    ];

    for (const { pages, category, children, child, phrase } of cases) {
      showRootPage(pages);
      clickButton(category);

      expect(currentPhrase()).toBe('Elegí una opción');
      expect(gridOptionLabels()).toEqual(children);

      clickButton(child);

      expect(currentPhrase()).toBe(phrase);

      clickButton('Inicio');
    }
  });

  it('enables terminal No encuentro mi opción outside the grid and opens four local rescue buttons', () => {
    clickButton('Otras opciones');
    clickButton('Otras opciones');

    const noOptionButton = actionButton('No encuentro mi opción');
    const grid = nativeElement().querySelector('.communication-grid');

    expect(noOptionButton.disabled).toBe(false);
    expect(noOptionButton.closest('.communication-grid')).not.toBe(grid);
    expect(noOptionButton.getAttribute('aria-describedby')).toBe('no-option-explanation');
    expect(noOptionButton.getAttribute('aria-label')).toBe(
      'No encuentro mi opción; mostrar alternativas locales de rescate',
    );
    expect(nativeElement().querySelector('#no-option-explanation')?.textContent).toContain(
      'cuatro alternativas locales de rescate',
    );

    noOptionButton.click();
    fixture.detectChanges();

    expect(gridOptionLabels()).toEqual([
      'Necesito ayuda',
      'No sé explicarlo',
      'Volver',
      'Empezar de nuevo',
    ]);
    expect(gridOptionLabels()).not.toContain('Baño e higiene');
    expect(gridOptionLabels()).not.toContain('Ayuda');
    expect(actionButton('Necesito ayuda').getAttribute('aria-label')).toBe(
      'Rescate local: Necesito ayuda',
    );
  });

  it('updates only the visible phrase for rescue communication alternatives', () => {
    openRescueMode();

    clickButton('Necesito ayuda');

    expect(currentPhrase()).toBe('Necesito ayuda');
    expect(gridOptionLabels()).toEqual([
      'Necesito ayuda',
      'No sé explicarlo',
      'Volver',
      'Empezar de nuevo',
    ]);

    clickButton('No sé explicarlo');

    expect(currentPhrase()).toBe('No sé explicarlo');
    expect(gridOptionLabels()).toEqual([
      'Necesito ayuda',
      'No sé explicarlo',
      'Volver',
      'Empezar de nuevo',
    ]);
  });

  it('does not discard rescue phrase or context when terminal fallback is activated again in rescue', () => {
    openRescueMode();
    clickButton('No sé explicarlo');

    clickButton('No encuentro mi opción');

    expect(currentPhrase()).toBe('No sé explicarlo');
    expect(gridOptionLabels()).toEqual([
      'Necesito ayuda',
      'No sé explicarlo',
      'Volver',
      'Empezar de nuevo',
    ]);
  });

  it('wires rescue Volver to restore the frozen tree page', () => {
    openRescueMode();
    clickButton('No sé explicarlo');

    clickButton('Volver');

    expect(currentPhrase()).toBe('Elegí una opción');
    expect(gridOptionLabels()).toEqual(['Baño e higiene', 'Ayuda']);
    expect(actionButton('No encuentro mi opción').disabled).toBe(false);
  });

  it('wires rescue Empezar de nuevo to exit rescue and reset the root', () => {
    openRescueMode();
    clickButton('Necesito ayuda');

    clickButton('Empezar de nuevo');

    expect(currentPhrase()).toBe('Elegí una opción');
    expect(gridOptionLabels()).toEqual([
      'Me encuentro mal',
      'Necesito algo',
      'Quiero algo',
      'No quiero',
    ]);
    expect(actionButton('Otras opciones').disabled).toBe(false);
  });

  function openRescueMode(): void {
    clickButton('Otras opciones');
    clickButton('Otras opciones');
    clickButton('No encuentro mi opción');
  }

  function showRootPage(pageIndex: number): void {
    for (let currentPage = 0; currentPage < pageIndex; currentPage += 1) {
      clickButton('Otras opciones');
    }
  }

  function clickButton(label: string): void {
    actionButton(label).click();
    fixture.detectChanges();
  }

  function currentPhrase(): string {
    return textContent('#current-phrase');
  }

  function gridOptionLabels(): string[] {
    return Array.from(nativeElement().querySelectorAll('.communication-option__label')).map(
      (element) => element.textContent?.trim() ?? '',
    );
  }

  function actionButton(label: string): HTMLButtonElement {
    const button = Array.from(nativeElement().querySelectorAll('button')).find(
      (candidate): candidate is HTMLButtonElement =>
        candidate.textContent?.trim() === label ||
        candidate.querySelector('.communication-option__label')?.textContent?.trim() === label,
    );

    if (button === undefined) {
      throw new Error(`Button not found: ${label}`);
    }

    return button;
  }

  function textContent(selector: string): string {
    return nativeElement().querySelector(selector)?.textContent?.trim() ?? '';
  }

  function nativeElement(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }
});
