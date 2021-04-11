
import dateFormat from 'dateformat'

export function parseISOString(s: any) {
    console.log(`Got ${s}`)
    var b = s.split(/\D+/);
    console.log(`got ${s} and created ${b}`)
    return new Date(Date.UTC(+b[0], +b[1]-1,+ b[2],+b[3], +b[4], +b[5], +b[6]));
  }
export function shortDate(s: string) {
    const date: Date = parseISOString(s)
    return dateFormat(date, 'yyyy-mm-dd') as string
}

// export default {parseISOString: parseISOString, shortDate:shortDate}