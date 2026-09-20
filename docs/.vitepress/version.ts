/**
 * The TVMJS release this documentation describes.
 *
 * Pinned rather than read from `npm view` at build time: the docs are written against a
 * specific release (the Releases section documents 1.1.0), a build must produce the same
 * output from the same commit, and a network failure must not silently change the version
 * shown in the nav. Bump this in the same commit that updates the docs for a new release.
 */
export const TVMJS_VERSION = '1.1.0';
