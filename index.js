const puppeteer = require('puppeteer');
const config = require('./config.json')


function test(log, pass) {
    
 (async () => {

    /* Open browser + login ukr.net */
    const browser = await puppeteer.launch({headless: false, defaultViewport: null});
    const page = await browser.newPage();

    const buttonWriteLetter = '//button[text()=\'Написати листа\']';
    const emailField = '//input[@name=\'toFieldInput\']';
    const emailTheme = '//input[@name=\'subject\']';

    await page.goto('https://accounts.ukr.net',{waitUntil:'networkidle0'});
    await page.type('#id-l',log,{delay: 20});
    await page.type('#id-p',pass,{delay: 20});
    const buttonLogin = await page.$x('//button[div[text()=\'Увійти\']]');
    await buttonLogin[0].click({delay:20});

    /* Sending 10 letters */
   for(let i = 0; i < 10; i++){
        const randomTextMessage = Math.random().toString(36).substring(2, 12);

        await page.waitForXPath(buttonWriteLetter);
        const buttonWrite = await page.$x(buttonWriteLetter);
        await buttonWrite[0].click({delay:5});

        await page.waitForXPath(emailField);
        const inputMail = await page.$x(emailField);
        await inputMail[0].type(log,{delay: 5})

        await page.waitForXPath(emailTheme);
        const inputTheme = await page.$x(emailTheme);
        await inputTheme[0].type(`"Theme#${i}"`,{delay:5});

        await page.waitForSelector("iframe");
        const elementFrame = await page.$(`#mce_${i}_ifr`);
        const frame = await elementFrame.contentFrame();
        await frame.waitForSelector('#tinymce');

        const emailBody = await frame.$('#tinymce');
        await emailBody.type(randomTextMessage,{delay:5});
        const buttonSend = await page.$x('//button[text()=\'Надіслати\']');
        await buttonSend[0].click({delay:5});

        await page.waitForXPath('//button[text()=\'Написати ще\']', {visible: true});
        const buttonSendOneMore = await page.$x('//button[text()=\'Написати ще\']');
        await buttonSendOneMore[0].click({delay:20});

        await frame.parentFrame();
    }

    const buttonInEmail = await page.$x('//span[text()=\'Вхідні\']');
    await buttonInEmail[0].click({delay:20});

    const allMessages = await page.$x('//tbody/tr/td[contains(@class,\'subject\')]');
    const messageMap = new Map();

    function getVowels(str) {
        if (str === null) {
            return 0;
        }
        return str.length;
    }

    const splitValue = new Array();
    const splitLeteral = new Array();
    for(let i = 0; i < allMessages.length;i++){

        const value = await page.evaluate(el => el.textContent, allMessages[i]);
        const dataArray = value.toString().split(" ");
        messageMap.set(dataArray[0],dataArray[1]);

        splitValue[i] = dataArray[1].toString().match(/\d/g);
        splitValue[i] = getVowels(splitValue[i]);
        splitLeteral[i] = dataArray[1].toString().match(/[a-z]/g);
        splitLeteral[i] = getVowels(splitLeteral[i]);
    }

    await page.waitForXPath(buttonWriteLetter);
    const buttonWrite = await page.$x(buttonWriteLetter);
    await buttonWrite[0].click({delay:25});

    await page.waitForXPath(emailField);
    const inputMail = await page.$x(emailField);
    await inputMail[0].type(log,{delay:25})

    await page.waitForXPath(emailTheme);
    const inputTheme = await page.$x(emailTheme);
    await inputTheme[0].type('Last one',{delay:25});

    let iter = 0;
    for (let key of messageMap.keys()) {

        await page.waitForSelector("iframe");
        const elementFrame = await page.$(`#mce_${11}_ifr`);
        const frame = await elementFrame.contentFrame();
        await frame.waitForSelector('#tinymce');

        const emailBody = await frame.$('#tinymce');
        await emailBody.type(`"Received mail on theme ${key} with message: ${messageMap.get(key)}. It contains ${splitLeteral[iter]} letters and ${splitValue[iter]} numbers"\n`,{delay:15});

        iter++;
    }
    await page.waitForXPath('//button[text()=\'Надіслати\']');
    const buttonSend = await page.$x('//button[text()=\'Надіслати\']');
    await buttonSend[0].click({delay: 20});

    await page.$x('//span[text()=\'Вхідні\']');
    await buttonInEmail[0].click({delay:20});

    await page.waitForXPath('//div[@class =\'msglist__checkbox\']/label/span',{visible:true});
    const selectAllLetters = await page.$x('//div[@class =\'msglist__checkbox\']/label/span');
    await selectAllLetters[0].click({delay: 20});

    await page.waitForXPath('//div[@class = \'controls controls_msglist\']/div/a[text()=\'Видалити\']',{visible:true});
    const deleteLetters = await page.$x('//div[@class = \'controls controls_msglist\']/div/a[text()=\'Видалити\']');
    await deleteLetters[0].click({delay: 20});

   //await browser.close();
})();
}
Promise.all([
    test(config.login1[0],config.login1[1]),
    test(config.login2[0],config.login2[1]),
    test(config.login3[0],config.login3[1])
])