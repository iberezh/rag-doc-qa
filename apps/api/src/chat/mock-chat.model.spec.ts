import { MockChatModel } from './mock-chat.model';

describe('MockChatModel', () => {
  it('streams a multi-token answer that includes a citation marker', async () => {
    const model = new MockChatModel();
    let answer = '';
    let tokens = 0;

    for await (const token of model.stream()) {
      answer += token;
      tokens += 1;
    }

    expect(tokens).toBeGreaterThan(1);
    expect(answer).toContain('[1]');
  });
});
