import Helper from './helper';

describe('Helper class', () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });

  it('should return TRUE if string is a URL when calling isUrl()', () => {
    expect(helper.isUrl('http://traveldk.com')).toBeTruthy();
  });

  it(`should return TRUE if string contains '.xml' when calling isXml()`, () => {
    expect(helper.isXml('http://traveldk.com/sitemap.xml')).toBeTruthy();
  });
});
