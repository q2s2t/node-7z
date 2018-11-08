/**
 * For less cryptic API
 */
export const swApiNames = {
  // Booleans
  recursive: 'r', // Recurse subdirectories. For `-r0` usage see `raw`
  deleteFilesAfter: 'sdel', // Delete files after compression
  largePageMode: 'spl', // Set Large Pages mode
  storeNtSecurity: 'sni', // Store NT security
  alternateStreamExtract: 'snc', // Extract file as alternate stream, if there is ':' character in name
  alternateStreamReplace: 'snr', // Replace ':' character to '_' character in paths of alternate streams
  storeHardLinks: 'snh', // Store hard links as links (WIM and TAR formats only)
  storeSymLinks: 'snl', // Store symbolic links as links (WIM and TAR formats only)
  toStdout: 'so', // Write data to stdout
  noWildcards: 'spd', // Disable wildcard matching for file names
  noRootDuplication: 'spe', // Eliminate duplication of root folder for extract command
  fullyQualifiedPaths: 'spf', // Use fully qualified file paths
  openFiles: 'ssw', // Compress files open for writing
  latestTimeStamp: 'stl', // Set archive timestamp from the most recently modified file
  yesToAll: 'y', // Assume Yes on all queries
  // Context Booleans
  alternateStreamStore: 'sns', // Store NTFS alternate Streams
  caseSensitive: 'ssc', // Set Sensitive Case mode
  // Arguments
  overwrite: 'ao', // Overwrite mode
  logLevel: 'bb', // Set output log level
  outputDir: 'o', // Set Output directory
  password: 'p', // Set Password
  archiveNameMode: 'sa', // Set Archive name mode
  hashMethod: 'scrc', // Set hash function
  listFileCharset: 'scs', // Set charset for list files
  sfx: 'sfx', // Create SFX archive
  fromStdin: 'si', // Read data from StdIn
  cpuAffinity: 'stm', // Set CPU thread affinity mask (hexadecimal number).
  excludeArchiveType: 'stx', // Exclude archive type
  archiveType: 't', // Type of archive
  updateOptions: 'u', // Update options
  workingDir: 'w', // Set Working directory
  // Repeatings
  includeArchive: 'ai', // Include archive filenames
  excludeArchive: 'ax', // Exclude archive filenames
  outputStreams: 'bs', // Set output stream for output/error/progress
  include: 'i', // Include filenames
  method: 'm', // Set Compression Method
  volumes: 'v', // Create Volumes
  exlude: 'x'// Exclude filenames
}

/**
 * Switches that can be toggled on or off (boolean switches). Default values
 * are based on the 7-zip documentation.
 */
export const swDefaultBool = {
  r: false, // Recurse subdirectories. For `-r0` usage see `raw`
  sdel: false, // Delete files after compression
  spl: false, // Set Large Pages mode
  sni: false, // Store NT security
  snc: false, // Extract file as alternate stream, if there is ':' character in name
  snr: false, // Replace ':' character to '_' character in paths of alternate streams
  snh: false, // Store hard links as links (WIM and TAR formats only)
  snl: false, // Store symbolic links as links (WIM and TAR formats only)
  so: false, // Write data to stdout
  spd: false, // Disable wildcard matching for file names
  spe: false, // Eliminate duplication of root folder for extract command
  spf: false, // Use fully qualified file paths
  ssw: false, // Compress files open for writing
  stl: false, // Set archive timestamp from the most recently modified file
  y: false // Assume Yes on all queries
}

/**
 * Switches that ca be toggles on or of. Their default values changes according
 * to the context (command, platform, ...).
 */
export const swContextBool = {
  sns: undefined, // Store NTFS alternate Streams
  ssc: undefined // Set Sensitive Case mode
}

/**
 * Switches that can be applied multiple times
 */
export const swRepeating = {
  ai: undefined, // Include archive filenames
  ax: undefined, // Exclude archive filenames
  bs: undefined, // Set output stream for output/error/progress
  i: undefined, // Include filenames
  m: undefined, // Set Compression Method
  v: undefined, // Create Volumes
  x: undefined // Exclude filenames
}

/**
 * Switches with arguments
 */
export const swArgs = {
  ao: undefined, // Overwrite mode
  bb: undefined, // Set output log level
  o: undefined, // Set Output directory
  p: undefined, // Set Password
  // r: undefined, // Recurse subdirectories. Use boolean instead
  sa: undefined, // Set Archive name mode
  scrc: undefined, // Set hash function
  scs: undefined, // Set charset for list files
  sfx: undefined, // Create SFX archive
  si: undefined, // Read data from StdIn
  stm: undefined, // Set CPU thread affinity mask (hexadecimal number).
  stx: undefined, // Exclude archive type
  t: undefined, // Type of archive
  u: undefined, // Update options
  w: undefined // Set Working directory
}

/**
 * Stages represents the advancement of the 7z stdout.
 * 1 - Headers: Versions of 7zip, specs
 * 2 - Body: The list of files
 * 3 - Footers: 'Everything is Ok', file count
 */
export const STAGE_HEADERS = Symbol('STAGE_HEADERS')
export const STAGE_BODY = Symbol('STAGE_BODY')
export const STAGE_FOOTERS = Symbol('STAGE_FOOTERS')
