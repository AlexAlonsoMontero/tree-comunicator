import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePage } from './home.page';
import { VoiceOutput } from '../../../application/voice-output';
import { CapacitorVoiceOutput } from '../../../infrastructure/voice/capacitor-voice-output';
import { VOICE_OUTPUT } from './home.page';
import { vi } from 'vitest';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let voice: VoiceOutput;

  beforeEach(async () => {
    vi.useFakeTimers();
    voice = { speak: vi.fn().mockResolvedValue(undefined) };
    await TestBed.configureTestingModule({
      imports: [HomePage],
    })
      .overrideComponent(HomePage, {
        remove: { providers: [{ provide: VOICE_OUTPUT, useClass: CapacitorVoiceOutput }] },
        add: { providers: [{ provide: VOICE_OUTPUT, useValue: voice }] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('RA-007/RD-003 focuses and reads on a short press without navigating', () => {
    const button = actionButton('Me encuentro mal');
    button.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(100);
    button.dispatchEvent(new Event('pointerup', { bubbles: true }));
    fixture.detectChanges();
    expect(gridOptionLabels()[0]).toBe('Me encuentro mal');
    expect(button.classList.contains('communication-option--focused')).toBe(true);
    expect(voice.speak).toHaveBeenCalledWith('Me encuentro mal');
  });

  it('repeats the focused option after a short press without navigating', () => {
    const button = actionButton('Necesito algo');
    button.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(100);
    button.dispatchEvent(new Event('pointerup', { bubbles: true }));
    fixture.detectChanges();

    vi.mocked(voice.speak).mockClear();
    clickButton('Repetir');

    expect(gridOptionLabels()).toEqual([
      'Me encuentro mal',
      'Necesito algo',
      'Quiero algo',
      'No quiero',
    ]);
    expect(button.classList.contains('communication-option--focused')).toBe(true);
    expect(voice.speak).toHaveBeenCalledTimes(1);
    expect(voice.speak).toHaveBeenCalledWith('Necesito algo');
  });

  it('repeats the visible fallback phrase when no option is focused', () => {
    clickButton('Repetir');

    expect(currentPhrase()).toBe('Elegí una opción');
    expect(voice.speak).toHaveBeenCalledTimes(1);
    expect(voice.speak).toHaveBeenCalledWith('Elegí una opción');
  });

  it('repeats the derived phrase when the focused option no longer applies', () => {
    clickButton('Me encuentro mal');
    clickButton('Me duele');

    expect(currentPhrase()).toBe('Me duele');
    expect(gridOptionLabels()).toEqual(['Barriga', 'Cabeza']);

    vi.mocked(voice.speak).mockClear();
    clickButton('Repetir');

    expect(voice.speak).toHaveBeenCalledTimes(1);
    expect(voice.speak).toHaveBeenCalledWith('Me duele');
  });

  it('keeps focus and confirmation navigation working when voice output rejects', async () => {
    vi.mocked(voice.speak).mockRejectedValue(new Error('offline voice unavailable'));

    const button = actionButton('Necesito algo');
    button.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(100);
    button.dispatchEvent(new Event('pointerup', { bubbles: true }));
    await Promise.resolve();
    fixture.detectChanges();

    expect(button.classList.contains('communication-option--focused')).toBe(true);
    expect(gridOptionLabels()).toEqual([
      'Me encuentro mal',
      'Necesito algo',
      'Quiero algo',
      'No quiero',
    ]);
    expect(voice.speak).toHaveBeenCalledWith('Necesito algo');

    button.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(800);
    button.dispatchEvent(new Event('pointerup', { bubbles: true }));
    await Promise.resolve();
    fixture.detectChanges();

    expect(gridOptionLabels()).toEqual(['Agua', 'Comer']);
    expect(currentPhrase()).toBe('Elegí una opción');
    expect(voice.speak).toHaveBeenCalledWith('Necesito algo');
  });

  it('RA-008a cancels a held press on release before threshold', () => {
    const button = actionButton('Me encuentro mal');
    button.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(400);
    button.dispatchEvent(new Event('pointerup', { bubbles: true }));
    vi.advanceTimersByTime(500);
    fixture.detectChanges();
    expect(gridOptionLabels()[0]).toBe('Me encuentro mal');
    expect(button.classList.contains('communication-option--confirming')).toBe(false);
  });

  it('RA-008 confirms exactly once after the hold threshold', () => {
    const button = actionButton('Me encuentro mal');
    button.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(800);
    button.dispatchEvent(new Event('pointerup', { bubbles: true }));
    fixture.detectChanges();

    expect(gridOptionLabels()).toEqual(['Me duele', 'Estoy mareado', 'Tengo náuseas']);
    expect(voice.speak).toHaveBeenCalledTimes(1);
    expect(voice.speak).toHaveBeenCalledWith('Me encuentro mal');
  });

  it('cancels a previous hold, focuses the new option, and reads the newly focused option', () => {
    const firstButton = actionButton('Me encuentro mal');
    const secondButton = actionButton('Necesito algo');

    firstButton.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(300);
    secondButton.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    fixture.detectChanges();

    expect(firstButton.classList.contains('communication-option--confirming')).toBe(false);
    expect(secondButton.classList.contains('communication-option--focused')).toBe(true);
    expect(voice.speak).toHaveBeenCalledTimes(1);
    expect(voice.speak).toHaveBeenCalledWith('Necesito algo');

    vi.advanceTimersByTime(600);
    secondButton.dispatchEvent(new Event('pointerup', { bubbles: true }));
    fixture.detectChanges();

    expect(gridOptionLabels()).toEqual([
      'Me encuentro mal',
      'Necesito algo',
      'Quiero algo',
      'No quiero',
    ]);
    expect(voice.speak).toHaveBeenCalledTimes(1);
  });

  it('shows visible confirmation progress while an option is held', () => {
    actionButton('Me encuentro mal').dispatchEvent(new Event('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(400);
    vi.clearAllTimers();
    fixture.changeDetectorRef.detectChanges();

    const heldButton = actionButton('Me encuentro mal');
    expect(heldButton.classList.contains('communication-option--confirming')).toBe(true);
    expect(heldButton.style.getPropertyValue('--confirmation-progress')).toBe('50%');
  });

  it('cancels pointerleave and pointercancel without short-press speech or confirmation', () => {
    const leaveButton = actionButton('Me encuentro mal');
    leaveButton.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(300);
    leaveButton.dispatchEvent(new Event('pointerleave', { bubbles: true }));
    vi.advanceTimersByTime(600);
    fixture.detectChanges();

    expect(leaveButton.classList.contains('communication-option--confirming')).toBe(false);
    expect(voice.speak).not.toHaveBeenCalled();
    expect(gridOptionLabels()).toEqual([
      'Me encuentro mal',
      'Necesito algo',
      'Quiero algo',
      'No quiero',
    ]);

    const cancelButton = actionButton('Necesito algo');
    cancelButton.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(300);
    cancelButton.dispatchEvent(new Event('pointercancel', { bubbles: true }));
    vi.advanceTimersByTime(600);
    fixture.detectChanges();

    expect(cancelButton.classList.contains('communication-option--confirming')).toBe(false);
    expect(voice.speak).not.toHaveBeenCalled();
    expect(gridOptionLabels()).toEqual([
      'Me encuentro mal',
      'Necesito algo',
      'Quiero algo',
      'No quiero',
    ]);
  });

  it('ignores repeated keyboard keydown events so the hold timer is not reset', () => {
    const button = actionButton('Me encuentro mal');

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    vi.advanceTimersByTime(500);
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', repeat: true, bubbles: true }),
    );
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(gridOptionLabels()).toEqual(['Me duele', 'Estoy mareado', 'Tengo náuseas']);
    expect(voice.speak).toHaveBeenCalledTimes(1);
  });

  it('confirms exactly once when pointerup follows an already fired long-press timer', () => {
    const button = actionButton('Me encuentro mal');

    button.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(800);
    vi.advanceTimersByTime(100);
    button.dispatchEvent(new Event('pointerup', { bubbles: true }));
    fixture.detectChanges();

    expect(gridOptionLabels()).toEqual(['Me duele', 'Estoy mareado', 'Tengo náuseas']);
    expect(voice.speak).toHaveBeenCalledTimes(1);
    expect(voice.speak).toHaveBeenCalledWith('Me encuentro mal');
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
    const button = actionButton(label);
    if (button.classList.contains('communication-option')) {
      button.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      vi.advanceTimersByTime(800);
      button.dispatchEvent(new Event('pointerup', { bubbles: true }));
    } else {
      button.click();
    }
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
