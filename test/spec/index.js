import Pipeline from 'dist/index';
import { expect } from 'chai';

describe('Test suite', () => {
  var pipeline, input, result;

  describe('And creating an empty pipeline', () => {
    describe('and running the pipeline Synchronously', () => {
      beforeEach(() => {
        input = 3;
        result = Pipeline().runSync(input);
      });

      it('then the final result is whatever is passed in', () => {
        expect(result).to.equal(input);
      });
    });

    describe('and running the pipeline Asynchronously', () => {
      beforeEach(() => {
        input = 3;
        return Pipeline()
          .runAsync(input)
          .then(v => {
            result = v;
          });
      });

      it('then the final result is whatever is passed in', () => {
        expect(result).to.equal(input);
      });
    });
  });

  describe('And creating a pipeline with 1 handler', () => {
    var handler1;

    describe('and running the pipeline Synchronously', () => {
      beforeEach(() => {
        handler1 = sinon.stub().returns(2);
        pipeline = Pipeline([handler1]);
        input = 5;
        result = pipeline.runSync(input);
      });

      it('then the handler was called with the correct input', () => {
        sinon.assert.calledWith(handler1, input);
      });

      it('then the pipeline generated the expected output', () => {
        expect(result).to.equal(2);
      });
    });

    describe('and running the pipeline Asynchronously', () => {
      beforeEach(() => {
        handler1 = sinon.stub().returns(Promise.resolve(2));
        pipeline = Pipeline([handler1]);
        input = 5;
        return pipeline
          .runAsync(input)
          .then(v => {
            result = v;
          });
      });

      it('then the handler was called with the correct input', () => {
        sinon.assert.calledWith(handler1, input);
      });

      it('then the pipeline generated the expected output', () => {
        expect(result).to.equal(2);
      });
    });
  });

  describe('And creating a pipeline with 2 handler', () => {
    var handler1, handler2;

    describe('and running the pipeline Synchronously', () => {
      beforeEach(() => {
        handler1 = sinon.stub().returns(2);
        handler2 = sinon.stub().returns(45);
        pipeline = Pipeline([handler1, handler2]);
        input = 5;
        result = pipeline.runSync(input);
      });

      it('then the handler1 was called with the correct input', () => {
        sinon.assert.calledWith(handler1, input);
      });

      it('then the handler2 was called with the correct input', () => {
        sinon.assert.calledWith(handler2, 2);
      });

      it('then the pipeline generated the expected output', () => {
        expect(result).to.equal(45);
      });
    });

    describe('and running the pipeline Asynchronously', () => {
      beforeEach(() => {
        handler1 = sinon.stub().returns(Promise.resolve(2));
        handler2 = sinon.stub().returns(Promise.resolve(45));
        pipeline = Pipeline([handler1, handler2]);
        input = 5;
        return pipeline
          .runAsync(input)
          .then(v => {
            result = v;
          });
      });

      it('then the handler1 was called with the correct input', () => {
        sinon.assert.calledWith(handler1, input);
      });

      it('then the handler2 was called with the correct input', () => {
        sinon.assert.calledWith(handler2, 2);
      });

      it('then the pipeline generated the expected output', () => {
        expect(result).to.equal(45);
      });
    });

    describe('and running the pipeline Synchronously and cancelling the first handler', () => {
      beforeEach(() => {
        handler1 = sinon.spy((val, cancel) => { cancel(); return 32; });
        handler2 = sinon.stub().returns(45);
        pipeline = Pipeline([handler1, handler2]);
        input = 5;
        result = pipeline.runSync(input);
      });

      it('then the handler1 was called with the correct input', () => {
        sinon.assert.calledWith(handler1, input);
      });

      it('then the handler2 is NOT called', () => {
        sinon.assert.notCalled(handler2);
      });

      it('then the pipeline generated the expected output', () => {
        expect(result).to.equal(32);
      });
    });

    describe('and running the pipeline Asynchronously and cancelling the first handler', () => {
      beforeEach(() => {
        handler1 = sinon.spy((val, cancel) => { cancel(); return Promise.resolve(32); });
        handler2 = sinon.stub().returns(Promise.resolve(45));
        pipeline = Pipeline([handler1, handler2]);
        input = 5;
        return pipeline
          .runAsync(input)
          .then(v => {
            result = v;
          });
      });

      it('then the handler1 was called with the correct input', () => {
        sinon.assert.calledWith(handler1, input);
      });

      it('then the handler2 is NOT called', () => {
        sinon.assert.notCalled(handler2);
      });

      it('then the pipeline generated the expected output', () => {
        expect(result).to.equal(32);
      });
    });
  });

});
