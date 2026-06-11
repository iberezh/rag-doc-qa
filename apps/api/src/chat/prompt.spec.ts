import { buildMessages } from './prompt';

describe('buildMessages', () => {
  it('starts with a system instruction to cite sources', () => {
    const [system] = buildMessages('q', 'ctx');
    expect(system?.role).toBe('system');
    expect(system?.content.toLowerCase()).toContain('cite');
  });

  it('embeds the context and question in the user message', () => {
    const messages = buildMessages('What is X?', '[1] (a.txt) X is a thing');
    const user = messages[1];
    expect(user?.role).toBe('user');
    expect(user?.content).toContain('[1] (a.txt) X is a thing');
    expect(user?.content).toContain('What is X?');
  });
});
