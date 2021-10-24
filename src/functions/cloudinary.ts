const normalize = (src) => {
  return src[0] === '/' ? src.slice(1) : src
}

export const cloudinaryLoader = ({ src, width, style }) => {
  return `${normalize(src)}`
}
