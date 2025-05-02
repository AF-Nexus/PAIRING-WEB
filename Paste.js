const fs = require('fs');
const path = require('path');
const PASTEBIN_API_KEY = 'EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL';

async function uploadToPastebin(input, title = 'Untitled', format = 'json', privacy = '1') {
    try {
        const { PasteClient, Publicity } = await import('pastebin-api');
        const client = new PasteClient(PASTEBIN_API_KEY);

        const publicityMap = {
            '0': Publicity.Public,
            '1': Publicity.Unlisted,
            '2': Publicity.Private,
        };

        let contentToUpload = '';

        if (Buffer.isBuffer(input)) {
            contentToUpload = input.toString();
        } else if (typeof input === 'string') {
            if (input.startsWith('data:')) {
                const base64Data = input.split(',')[1];
                contentToUpload = Buffer.from(base64Data, 'base64').toString();
            } else if (input.startsWith('http://') || input.startsWith('https://')) {
                contentToUpload = input;
            } else if (fs.existsSync(input)) {
                contentToUpload = fs.readFileSync(input, 'utf8');
            } else {
                contentToUpload = input;
            }
        } else {
            throw new Error('Unsupported input type. Please provide text, a file path, or base64 data.');
        }

        const pasteUrl = await client.createPaste({
            code: contentToUpload,
            expireDate: 'N',
            format: format,
            name: title,
            publicity: publicityMap[privacy],
        });

        console.log('Original Pastebin URL:', pasteUrl);

        const pasteId = pasteUrl.replace('https://pastebin.com/', '');
        const customUrl = `Some-Custom-Words_${pasteId}`;

        console.log('Custom URL:', customUrl);

        return customUrl;
    } catch (error) {
        console.error('Error uploading to Pastebin:', error);
        throw error;
    }
}

module.exports = uploadToPastebin;
