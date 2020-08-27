import { ClientModule } from './client.module';

describe('FormModule', () => {
  let formModule: ClientModule;

  beforeEach(() => {
    formModule = new ClientModule();
  });

  it('should create an instance', () => {
    expect(ClientModule).toBeTruthy();
  });
});
