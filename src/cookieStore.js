
function getCookieDomain(){
    const parsedDomain = location.host.match('([a-zA-Z0-9]+.[a-zA-Z0-9]+)$'); 
    return `.${parsedDomain[0]}`;
}

export function cookieStore(domain, durationInMinutes) {
    if (!domain){
        domain = getCookieDomain();
    }
    if (typeof durationInMinutes !== "number") {
        durationInMinutes = 60*14;
    }

    return {
        getItem(name){
            var foundCookie = document.cookie.split(';')
                .find(item =>  item.trim().split('=')[0] === name);

            if (!foundCookie) return null;
    
            return decodeURIComponent(foundCookie.split('=')[1]);
        },
        setItem(name, value){
            const val = encodeURIComponent(value);
            const age = durationInMinutes*60; //age is session - todo: add option
            document.cookie = `${name}=${val}; max-age="${age}"; path=/; domain=${domain}`;
        }
    }
}
