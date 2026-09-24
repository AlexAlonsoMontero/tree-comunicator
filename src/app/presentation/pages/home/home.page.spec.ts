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
    expect(gridOptionLabels()).toEqual(['Me encuentro mal', 'Necesito algo', 'Baño e higiene', 'Ayuda']);
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
    expect(gridOptionLabels()).toEqual(['Me encuentro mal', 'Necesito algo', 'Baño e higiene', 'Ayuda']);
  });

  it('wires Inicio to reset navigation and clear the phrase', () => {
    clickButton('Me encuentro mal');
    clickButton('Me duele');
    clickButton('Barriga');

    clickButton('Inicio');

    expect(currentPhrase()).toBe('Elegí una opción');
    expect(gridOptionLabels()).toEqual(['Me encuentro mal', 'Necesito algo', 'Baño e higiene', 'Ayuda']);
  });

  it('wires Otras opciones to root pagination without placing pagination in the grid', () => {
    clickButton('Otras opciones');

    expect(gridOptionLabels()).toEqual(['Tengo hambre', 'Tengo sed']);
    expect(gridOptionLabels()).not.toContain('Otras opciones');
    expect(gridOptionLabels()).not.toContain('No encuentro mi opción');
  });

  it('renders disabled No encuentro mi opción outside the grid when there is no next page', () => {
    clickButton('Otras opciones');

    const noOptionButton = actionButton('No encuentro mi opción');
    const grid = nativeElement().querySelector('.communication-grid');

    expect(noOptionButton.disabled).toBe(true);
    expect(noOptionButton.closest('.communication-grid')).not.toBe(grid);
    expect(noOptionButton.getAttribute('aria-describedby')).toBe('no-option-explanation');
    expect(nativeElement().querySelector('#no-option-explanation')?.textContent).toContain(
      'acción local de rescate',
    );

    noOptionButton.click();
    fixture.detectChanges();

    expect(gridOptionLabels()).toEqual(['Tengo hambre', 'Tengo sed']);
  });

  function clickButton(label: string): void {
    actionButton(label).click();
    fixture.detectChanges();
  }

  function currentPhrase(): string {
    return textContent('#current-phrase');
  }

  function gridOptionLabels(): string[] {
    return Array.from(nativeElement().querySelectorAll('.communication-option__label')).map((element) =>
      element.textContent?.trim() ?? '',
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
