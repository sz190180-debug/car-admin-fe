export function getRcsPath(data) {
  if (!data) {
    return ''
  }
  return data.includes('://') ? data + ':4333' : `http://${data}:4333`
}

export function getActiveEndTimeText(data) {
  if (!data) {
    return ''
  }
  return data > 0 ? "售后质保剩余：" + data + "天数" : "超出质保：" + Math.abs(data) + "天数"
}

export function rcsSkip(record: Recordable) {
  const rcsPath = getRcsPath(record.rcs)
  if (rcsPath) {
    window.open(rcsPath, "_blank", "noopener,noreferrer");
  }
}

export function getDevicePath(data) {
  if (!data) {
    return ''
  }
  return data.includes('://') ? data + ':9998' : `http://${data}:9998`
}

export function deviceSkip(record: Recordable) {
  const devicePath = getDevicePath(record.ip)
  if (devicePath) {
    window.open(devicePath, "_blank", "noopener,noreferrer");
  }
}

export function rcsSkipC(url) {
  const rcsPath = getRcsPath(url)
  if (rcsPath) {
    window.open(rcsPath, "_blank", "noopener,noreferrer");
  }
}

export function deviceSkipC(url) {
  const devicePath = getDevicePath(url)
  if (devicePath) {
    window.open(devicePath, "_blank", "noopener,noreferrer");
  }
}
