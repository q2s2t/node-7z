
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
  y: true // Assume Yes on all queries
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
  bs: undefined, // Set output stream for output/error/progress
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
 * Default highWaterMark for streaming, same as child_process
 */
export const highWaterMark = 200 * 1024
