import {ReactExample} from '../../src/react-example';

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, (e) => { fail(e); done(); });
  };
}

describe('the ReactExample Module', () => {
  let re;
  it('should construct', testAsync(async function() {
    re = new ReactExample();
    expect(re).not.toBe(undefined);
  }));
});
