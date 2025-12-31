import * as path from 'path';
import { Browser, Page } from 'puppeteer';
import { CreateConfig } from '../../config/create-config.js';
import {
  base64MimeType,
  dowloadMetaFileBase64,
  downloadFileToBase64,
  fileToBase64,
  stickerSelect
} from '../helpers';
import { filenameFromMimeType } from '../helpers/filename-from-mimetype.js';
import { Message, SendFileResult, SendStickerResult } from '../model';
import { ChatState } from '../model/enum';
import { checkValuesSender } from '../helpers/layers-interface.js';
import { ListenerLayer } from './listener.layer.js';

export class SenderLayer extends ListenerLayer {
  constructor(
    public browser: Browser,
    public page: Page,
    session?: string,
    options?: CreateConfig
  ) {
    super(browser, page, session, options);
  }

  public async createCommunity(name: string, description: string) {
    return await this.page.evaluate(
      ({ name, description }) => {
        return WAPI.createCommunity(name, description);
      },
      { name, description }
    );
  }

  /**
   * Send List menu
   * @param to the numberid xxx@c.us
   * @param title the titulo
   * @param subTitle
   * @param description the description
   * @param buttonText the name button
   * @param menu List menu
   */
  public async sendListMenu(
    to: string,
    title: string,
    subTitle: string,
    description: string,
    buttonText: string,
    menu: Array<any>
  ): Promise<object> {
    const result = await this.page.evaluate(
      ({ to, title, subTitle, description, buttonText, menu }) => {
        return WAPI.sendListMenu(
          to,
          title,
          subTitle,
          description,
          buttonText,
          menu
        );
      },
      { to, title, subTitle, description, buttonText, menu }
    );
    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  //*PRO_
  /**
   * Send status text
   * @param text The text for the status
   */
  public async sendStatusText(text: string) {
    const typeFunction = 'sendText';
    const type = 'string';
    const check = [
      {
        param: 'text',
        type: type,
        value: text,
        function: typeFunction,
        isUser: true
      }
    ];
    const validating = checkValuesSender(check);
    if (typeof validating === 'object') {
      throw validating;
    }
    const to = 'status@broadcast';
    const result = await this.page.evaluate(
      ({ to, text }) => {
        return WAPI.sendMessage(to, text, true);
      },
      { to, text }
    );

    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Create poll
   * @param idUser chat id: xxxxx@us.c
   * @param poll
   */
  public async sendPollCreation(idUser: string, poll: any) {
    const result = await this.page.evaluate(
      ({ idUser, poll }) => {
        return WAPI.sendPollCreation(idUser, poll);
      },
      { idUser, poll }
    );
    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  //*PRO_
  /**
   * @param filePath path, http link or base64Encoded
   * @param description
   */
  public async sendImageStatus(
    filePath: string,
    description?: string
  ): Promise<SendFileResult> {
    let base64 = await downloadFileToBase64(filePath, [
      'image/gif',
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/webp'
    ]);

    if (!base64) {
      base64 = await fileToBase64(filePath);
    }

    if (!base64) {
      throw {
        erro: true,
        to: 'status',
        text: 'No such file or directory, open "' + filePath + '"'
      };
    }

    let filename = path.basename(filePath);
    let mimeType = base64MimeType(base64);

    if (!mimeType) {
      throw {
        erro: true,
        to: 'status',
        text: 'Invalid base64!'
      };
    }

    if (!mimeType.includes('image')) {
      throw {
        erro: true,
        to: 'status',
        text: 'Not an image, allowed formats gif, png, jpg, jpeg and webp'
      };
    }
    const to = 'status@broadcast';
    filename = filenameFromMimeType(filename, mimeType);

    const result = await this.page.evaluate(
      ({ to, base64, filename, description }) => {
        return WAPI.sendImage(
          base64,
          to,
          filename,
          description,
          'sendImageStatus'
        );
      },
      { to, base64, filename, description }
    );

    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Sends file from path
   * @param filePath File path
   * @param description
   */
  public async sendVideoStatus(filePath: string, description?: string) {
    let base64 = await downloadFileToBase64(filePath, ['video/mp4']);

    if (!base64) {
      base64 = await fileToBase64(filePath);
    }

    if (!base64) {
      throw {
        erro: true,
        to: 'status',
        text: 'No such file or directory, open "' + filePath + '"'
      };
    }

    let filename = path.basename(filePath);

    let mimeType = base64MimeType(base64);

    if (!mimeType) {
      throw {
        erro: true,
        to: 'status',
        text: 'Invalid base64!'
      };
    }

    if (!mimeType.includes('video')) {
      throw {
        erro: true,
        to: 'status',
        text: 'Not an video, allowed format mp4'
      };
    }

    filename = filenameFromMimeType(filename, mimeType);
    const to = 'status@broadcast';
    const result = await this.page.evaluate(
      ({ to, base64, filename, description }) => {
        return WAPI.sendFile(
          base64,
          to,
          filename,
          description,
          'sendVideoStatus',
          true
        );
      },
      { to, base64, filename, description }
    );
    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Sends a text message to given chat
   * @param to chat id: xxxxx@us.c
   * @param title
   * @param subtitle
   * @param buttons
   */
  public async sendButtons(
    to: string,
    title: string,
    subtitle: string,
    buttons: any
  ): Promise<object> {
    const typeFunction = 'sendButtons';
    const type = 'string';
    const obj = 'object';
    const check = [
      {
        param: 'to',
        type: type,
        value: to,
        function: typeFunction,
        isUser: true
      },
      {
        param: 'title',
        type: type,
        value: title,
        function: typeFunction,
        isUser: true
      },
      {
        param: 'subtitle',
        type: type,
        value: subtitle,
        function: typeFunction,
        isUser: true
      },
      {
        param: 'buttons',
        type: obj,
        value: buttons,
        function: typeFunction,
        isUser: true
      }
    ];
    const validating = checkValuesSender(check);
    if (typeof validating === 'object') {
      throw validating;
    }

    const result = await this.page.evaluate(
      ({ to, title, subtitle, buttons }) => {
        return WAPI.sendButtons(to, title, subtitle, buttons);
      },
      { to, title, subtitle, buttons }
    );
    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  public async sendTypeButtons(
    to: string,
    title: string,
    subtitle: string,
    footer: string,
    buttons: any
  ): Promise<object> {
    const result = await this.page.evaluate(
      ({ to, title, subtitle, footer, buttons }) => {
        return WAPI.sendTypeButtons(to, title, subtitle, footer, buttons);
      },
      { to, title, subtitle, footer, buttons }
    );
    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Sends a text message to given chat
   * @param to chat id: xxxxx@us.c
   * @param content text message
   * @param passId new id
   * @param checkNumber the number when submitting!
   * @param forcingReturn return without sending the message to the server!
   * @param delSend
   */
  public async sendText(
    to: string,
    content: string,
    passId?: any,
    checkNumber?: boolean,
    forcingReturn?: boolean,
    delSend?: boolean
  ): Promise<object> {
    const typeFunction = 'sendText';
    const type = 'string';
    const check = [
      {
        param: 'to',
        type: type,
        value: to,
        function: typeFunction,
        isUser: true
      },
      {
        param: 'content',
        type: type,
        value: content,
        function: typeFunction,
        isUser: true
      }
    ];
    const validating = checkValuesSender(check);
    if (typeof validating === 'object') {
      throw validating;
    }
    const result = await this.page.evaluate(
      ({ to, content, passId, checkNumber, forcingReturn, delSend }) => {
        return WAPI.sendMessage(
          to,
          content,
          undefined,
          passId,
          checkNumber,
          forcingReturn,
          delSend
        );
      },
      { to, content, passId, checkNumber, forcingReturn, delSend }
    );
    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Automatically sends a link with the auto generated link preview. You can also add a custom message to be added.
   * @param chatId chat id: xxxxx@us.c
   * @param url string A link, for example for youtube. e.g https://www.youtube.com/watch?v=Zi_XLOBDo_Y&list=RDEMe12_MlgO8mGFdeeftZ2nOQ&start_radio=1
   * @param title custom text as the message body, this includes the link or will be attached after the link
   * @param message
   */
  public async sendLinkPreview(
    chatId: string,
    url: string,
    title: string,
    message: string
  ): Promise<object> {
    const typeFunction = 'sendLinkPreview';
    const type = 'string';
    const check = [
      {
        param: 'chatId',
        type: type,
        value: chatId,
        function: typeFunction,
        isUser: true
      },
      {
        param: 'url',
        type: type,
        value: url,
        function: typeFunction,
        isUser: true
      },
      {
        param: 'title',
        type: type,
        value: title,
        function: typeFunction,
        isUser: false
      },
      {
        param: 'message',
        type: type,
        value: message,
        function: typeFunction,
        isUser: false
      }
    ];
    const validating = checkValuesSender(check);
    if (typeof validating === 'object') {
      throw validating;
    }
    const thumbnail = await dowloadMetaFileBase64(url);
    const result = await this.page.evaluate(
      ({ chatId, url, title, message, thumbnail }) => {
        return WAPI.sendLinkPreview(chatId, url, title, message, thumbnail);
      },
      { chatId, url, title, message, thumbnail }
    );
    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Sends image message base64
   * @param to Chat id
   * @param base64 File path, http link or base64Encoded
   * @param filename
   * @param caption
   * @param status
   */
  public async sendImageFromBase64(
    to: string,
    base64: string,
    filename?: string,
    caption?: string,
    status?: boolean
  ): Promise<SendFileResult> {
    const typeFunction = 'sendImageFromBase64';
    const type = 'string';
    const check = [
      {
        param: 'to',
        type: type,
        value: to,
        function: typeFunction,
        isUser: true
      },
      {
        param: 'base64',
        type: type,
        value: base64,
        function: typeFunction,
        isUser: true
      },
      {
        param: 'filename',
        type: type,
        value: filename,
        function: typeFunction,
        isUser: false
      }
    ];

    const validating = checkValuesSender(check);
    if (typeof validating === 'object') {
      throw validating;
    }

    let mimeType = base64MimeType(base64);

    if (!mimeType) {
      throw {
        erro: true,
        to: to,
        text: 'Invalid base64!'
      };
    }

    if (!mimeType.includes('image')) {
      throw {
        erro: true,
        to: to,
        text: 'Not an image, allowed formats gif, png, jpg, jpeg and webp'
      };
    }

    filename = filenameFromMimeType(filename, mimeType);

    const result = await this.page.evaluate(
      ({ to, base64, filename, caption, status }) => {
        return WAPI.sendImage(base64, to, filename, caption, status);
      },
      { to, base64, filename, caption, status }
    );

    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * only admin send messages
   * @param chatId Group
   * @param {boolean} type 'true' only admin can send messages or 'false' everyone can send
   */
  public async onlySendAdmin(chatId: string, type: boolean) {
    const result: any = await this.page
      .evaluate(
        ({ chatId, type }) => {
          return WAPI.onlySendAdmin(chatId, type);
        },
        { chatId, type }
      )
      .catch(() => {});
    if (result?.erro == true) {
      throw result;
    }
    return result;
  }

  public async sendMessageOptions(
    chat: any,
    content: any,
    options?: any
  ): Promise<Message> {
    const messageId = await this.page.evaluate(
      ({ chat, content, options }) => {
        return WAPI.sendMessageOptions(chat, content, options);
      },
      { chat, content, options }
    );
    return (await this.page.evaluate(
      (messageId: any) => WAPI.getMessageById(messageId),
      messageId
    )) as Message;
  }

  /**
   * Sends image message
   * @param to Chat id
   * @param filePath File path or http link
   * @param filename
   * @param caption
   * @param passId
   */
  public async sendImage(
    to: string,
    filePath: string,
    filename?: string,
    caption?: string,
    passId?: any
  ): Promise<SendFileResult> {
    let base64 = await downloadFileToBase64(filePath, [
      'image/gif',
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/webp'
    ]);

    if (!base64) {
      base64 = await fileToBase64(filePath);
    }

    if (!base64) {
      throw {
        erro: true,
        to: to,
        text: 'No such file or directory, open "' + filePath + '"'
      };
    }

    if (!filename) {
      filename = path.basename(filePath);
    }

    let mimeType = base64MimeType(base64);

    if (!mimeType) {
      throw {
        erro: true,
        to: to,
        text: 'Invalid base64!'
      };
    }

    if (!mimeType.includes('image')) {
      throw {
        erro: true,
        to: to,
        text: 'Not an image, allowed formats gif, png, jpg, jpeg and webp'
      };
    }

    filename = filenameFromMimeType(filename, mimeType);

    const result = await this.page.evaluate(
      ({ to, base64, filename, caption, passId }) => {
        return WAPI.sendImage(
          base64,
          to,
          filename,
          caption,
          'sendImage',
          false,
          passId
        );
      },
      { to, base64, filename, caption, passId }
    );

    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Sends message with thumbnail
   * @param thumb
   * @param url
   * @param title
   * @param description
   * @param chatId
   */
  public async sendMessageWithThumb(
    thumb: string,
    url: string,
    title: string,
    description: string,
    chatId: string
  ) {
    return await this.page.evaluate(
      ({ thumb, url, title, description, chatId }) => {
        WAPI.sendMessageWithThumb(thumb, url, title, description, chatId);
      },
      {
        thumb,
        url,
        title,
        description,
        chatId
      }
    );
  }

  /**
   * Replies to given mesage id of given chat id
   * @param to Chat id
   * @param content Message body
   * @param quotedMsg Message id to reply to.
   */
  public async reply(
    to: string,
    content: string,
    quotedMsg: string
  ): Promise<Message | object> {
    const typeFunction = 'reply';
    const type = 'string';
    const check = [
      {
        param: 'to',
        type: type,
        value: to,
        function: typeFunction,
        isUser: true
      },
      {
        param: 'content',
        type: type,
        value: content,
        function: typeFunction,
        isUser: true
      },
      {
        param: 'quotedMsg',
        type: type,
        value: quotedMsg,
        function: typeFunction,
        isUser: false
      }
    ];
    const validating = checkValuesSender(check);
    if (typeof validating === 'object') {
      throw validating;
    }
    const result: object = await this.page.evaluate(
      ({ to, content, quotedMsg }) => {
        return WAPI.reply(to, content, quotedMsg);
      },
      { to, content, quotedMsg }
    );

    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Send audio base64
   * @param to Chat id
   * @param base64 base64 data
   * @param passId new id
   */
  public async sendVoiceBase64(to: string, base64: string, passId?: any) {
    const mimeType: any = base64MimeType(base64);

    if (!mimeType) {
      throw {
        erro: true,
        to: to,
        text: 'Invalid base64!'
      };
    }

    if (
      !mimeType ||
      mimeType.includes('audio/mpeg') ||
      mimeType.includes('audio/mp3') ||
      mimeType.includes('audio/ogg')
    ) {
      const result = await this.page.evaluate(
        ({ to, base64, passId }) => {
          return WAPI.sendPtt(base64, to, passId);
        },
        { to, base64, passId }
      );
      if (result['erro'] == true) {
        throw result;
      }
      return result;
    } else {
      throw {
        erro: true,
        to: to,
        text: 'Use the MP3 format to be able to send an audio!'
      };
    }
  }

  /**
   * Send audio file
   * @param to Chat id
   * @param filePath Path file
   * @param passId new id
   * @param checkNumber the number when submitting!
   * @param forcingReturn return without sending the message to the server!
   * @param delSend
   */
  public async sendVoice(
    to: string,
    filePath: string,
    passId?: any,
    checkNumber?: boolean,
    forcingReturn?: boolean,
    delSend?: boolean
  ) {
    let base64: string | false = await downloadFileToBase64(filePath, [
      'audio/mpeg',
      'audio/mp3',
      'audio/ogg'
    ]);

    if (!base64) {
      base64 = await fileToBase64(filePath);
    }

    if (!base64) {
      throw {
        erro: true,
        to: to,
        text: 'No such file or directory, open "' + filePath + '"'
      };
    }

    const mimeInfo = base64MimeType(base64);

    if (
      !mimeInfo ||
      mimeInfo.includes('audio/mpeg') ||
      mimeInfo.includes('audio/mp3') ||
      mimeInfo.includes('audio/ogg')
    ) {
      const result: any = await this.page.evaluate(
        ({ to, base64, passId, checkNumber, forcingReturn, delSend }) => {
          return WAPI.sendPtt(
            base64,
            to,
            passId,
            checkNumber,
            forcingReturn,
            delSend
          );
        },
        { to, base64, passId, checkNumber, forcingReturn, delSend }
      );
      if (result['erro'] == true) {
        throw result;
      }
      return result;
    } else {
      throw {
        erro: true,
        to: to,
        text: 'Use the MP3 format to be able to send an audio!'
      };
    }
  }

  /**
   * Sends file
   * base64 parameter should have mime type already defined
   * @param to Chat id
   * @param base64 base64 data
   * @param filename
   * @param caption
   * @param passId
   */
  public async sendFileFromBase64(
    to: string,
    base64: string,
    filename: string,
    caption?: string,
    passId?: any
  ): Promise<SendFileResult> {
    let mimeType = base64MimeType(base64);

    if (!mimeType) {
      throw {
        erro: true,
        to: to,
        text: 'Invalid base64!'
      };
    }

    filename = filenameFromMimeType(filename, mimeType);

    const type = 'FileFromBase64';
    const result = await this.page.evaluate(
      ({ to, base64, filename, caption, type, passId }) => {
        return WAPI.sendFile(
          base64,
          to,
          filename,
          caption,
          type,
          undefined,
          passId
        );
      },
      { to, base64, filename, caption, type, passId }
    );
    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Sends file from path
   * @param to Chat id
   * @param filePath File path
   * @param filename
   * @param caption
   * @param passId
   * @param checkNumber
   * @param forcingReturn
   * @param delSend
   */
  public async sendFile(
    to: string,
    filePath: string,
    filename?: string,
    caption?: string,
    passId?: any,
    checkNumber?: boolean,
    forcingReturn?: boolean,
    delSend?: boolean
  ) {
    let base64 = await downloadFileToBase64(filePath);

    if (!base64) {
      base64 = await fileToBase64(filePath);
    }

    if (!base64) {
      throw {
        erro: true,
        to: to,
        text: 'No such file or directory, open "' + filePath + '"'
      };
    }

    if (!filename && typeof filename !== 'string') {
      filename = path.basename(filePath);
    }

    let mimeType = base64MimeType(base64);

    if (!mimeType) {
      throw {
        erro: true,
        to: to,
        text: 'Invalid base64!'
      };
    }

    filename = filenameFromMimeType(filename, mimeType);

    const result = await this.page.evaluate(
      ({
        to,
        base64,
        filename,
        caption,
        passId,
        checkNumber,
        forcingReturn,
        delSend
      }) => {
        return WAPI.sendFile(
          base64,
          to,
          filename,
          caption,
          'sendFile',
          undefined,
          passId,
          checkNumber,
          forcingReturn,
          delSend
        );
      },
      {
        to,
        base64,
        filename,
        caption,
        passId,
        checkNumber,
        forcingReturn,
        delSend
      }
    );
    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Sends a video to given chat as a gif, with caption or not, using base64
   * @param to chat id xxxxx@us.c
   * @param path
   * @param filename string xxxxx
   * @param caption string xxxxx
   */
  public async sendVideoAsGif(
    to: string,
    path: string,
    filename: string,
    caption: string
  ) {
    const base64 = await fileToBase64(path);
    if (base64) {
      return this.sendVideoAsGifFromBase64(to, base64, filename, caption);
    }
  }

  /**
   * Sends a video to given chat as a gif, with caption or not, using base64
   * @param to chat id xxxxx@us.c
   * @param base64 base64 data:video/xxx;base64,xxx
   * @param filename string xxxxx
   * @param caption string xxxxx
   */
  public async sendVideoAsGifFromBase64(
    to: string,
    base64: string,
    filename: string,
    caption: string
  ) {
    return await this.page.evaluate(
      ({ to, base64, filename, caption }) => {
        WAPI.sendVideoAsGif(base64, to, filename, caption);
      },
      { to, base64, filename, caption }
    );
  }

  /**
   * Sends contact card to iven chat id
   * @param to Chat id
   * @param contactsId Example: 0000@c.us | [000@c.us, 1111@c.us]
   * @param name
   */
  public async sendContactVcard(
    to: string,
    contactsId: string | string[],
    name?: string
  ) {
    const result = await this.page.evaluate(
      ({ to, contactsId, name }) => {
        return WAPI.sendContactVcard(to, contactsId, name);
      },
      { to, contactsId, name }
    );
    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Send a list of contact cards
   * @param to Chat id
   * @param contacts Example: | [000@c.us, 1111@c.us]
   */
  public async sendContactVcardList(to: string, contacts: string[]) {
    const result = await this.page.evaluate(
      ({ to, contacts }) => {
        return WAPI.sendContactVcardList(to, contacts);
      },
      { to, contacts }
    );
    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Forwards array of messages (could be ids or message objects)
   * @param to Chat id
   * @param messages Array of messages ids to be forwarded
   * @param skipMyMessages
   */
  public async forwardMessages(
    to: string,
    messages: string | string[],
    skipMyMessages: boolean
  ) {
    const result = await this.page.evaluate(
      ({ to, messages, skipMyMessages }) => {
        return WAPI.forwardMessages(to, messages, skipMyMessages).catch(
          (e) => e
        );
      },
      { to, messages, skipMyMessages }
    );
    if (typeof result['erro'] !== 'undefined' && result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Generates sticker from the provided animated gif image and sends it (Send image as animated sticker)
   *  @param path image path imageBase64 A valid gif image is required. You can also send via http/https (http://www.website.com/img.gif)
   *  @param to chatId '000000000000@c.us'
   */
  public async sendImageAsStickerGif(
    to: string,
    path: string
  ): Promise<SendStickerResult | false> {
    let b64 = await downloadFileToBase64(path, ['image/gif', 'image/webp']);
    if (!b64) {
      b64 = await fileToBase64(path);
    }
    if (b64) {
      const buff = Buffer.from(
        b64.replace(/^data:image\/(gif|webp);base64,/, ''),
        'base64'
      );
      const mimeInfo = base64MimeType(b64);
      if (!mimeInfo || mimeInfo.includes('image')) {
        let obj = await stickerSelect(buff, 1);
        if (typeof obj == 'object') {
          let _webb64 = obj['webpBase64'];
          let _met = obj['metadata'];

          const result = await this.page.evaluate(
            ({ _webb64, to, _met }) => {
              return WAPI.sendImageAsSticker(_webb64, to, _met, 'StickerGif');
            },
            { _webb64, to, _met }
          );
          if (result['erro'] == true) {
            throw result;
          }
          return result;
        } else {
          throw {
            error: true,
            message: 'Error with sharp library, check the console log'
          };
        }
      } else {
        console.log('Not an image, allowed format gif');
        return false;
      }
    }
  }

  /**
   * Generates sticker from given image and sends it (Send Image As Sticker)
   * @param path image path imageBase64 A valid png, jpg and webp image is required. You can also send via http/https (http://www.website.com/img.gif)
   * @param to chatId '000000000000@c.us'
   */
  public async sendImageAsSticker(
    to: string,
    path: string
  ): Promise<SendStickerResult | false> {
    let b64 = await downloadFileToBase64(path, [
      'image/gif',
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/webp'
    ]);

    if (!b64) {
      b64 = await fileToBase64(path);
    }

    if (b64) {
      const buff = Buffer.from(
        b64.replace(/^data:image\/(png|jpe?g|webp|gif);base64,/, ''),
        'base64'
      );

      const mimeInfo = base64MimeType(b64);

      if (!mimeInfo || mimeInfo.includes('image')) {
        let obj = await stickerSelect(buff, 0);
        if (typeof obj == 'object') {
          let _webb64 = obj['webpBase64'];
          let _met = obj['metadata'];
          const result = await this.page.evaluate(
            ({ _webb64, to, _met }) => {
              return WAPI.sendImageAsSticker(_webb64, to, _met, 'Sticker');
            },
            { _webb64, to, _met }
          );
          if (result['erro'] == true) {
            throw result;
          }
          return result;
        } else {
          throw {
            error: true,
            message: 'Error with sharp library, check the console log'
          };
        }
      } else {
        console.log('Not an image, allowed formats png, jpeg and webp');
        return false;
      }
    }
  }

  /**
   * TODO: Fix message not being delivered
   * Sends location to given chat id
   * @param to Chat id
   * @param latitude Latitude
   * @param longitude Longitude
   * @param title Text caption
   */
  public async sendLocation(
    to: string,
    latitude: string,
    longitude: string,
    title: string
  ) {
    const result = await this.page.evaluate(
      ({ to, latitude, longitude, title }) => {
        return WAPI.sendLocation(to, latitude, longitude, title);
      },
      { to, latitude, longitude, title }
    );
    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Starts typing ('Typing...' state)
   * @param chatId chat id: xxxxx@us.c
   * @param checkNumber the number when submitting!
   */
  public async startTyping(chatId: string, checkNumber: boolean) {
    const typeFunction = 'startTyping';
    const type = 'string';
    const check = [
      {
        param: 'chatId',
        type: type,
        value: chatId,
        function: typeFunction,
        isUser: true
      }
    ];
    const validating = checkValuesSender(check);
    if (typeof validating === 'object') {
      throw validating;
    }

    const result = await this.page.evaluate(
      ({ chatId, checkNumber }) => WAPI.startTyping(chatId, checkNumber),
      { chatId, checkNumber }
    );

    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Start Recording
   * @param chatId Chat id
   * @param checkNumber the number when submitting!
   */
  public async startRecording(chatId: string, checkNumber: boolean) {
    const typeFunction = 'startRecording';
    const type = 'string';
    const check = [
      {
        param: 'chatId',
        type: type,
        value: chatId,
        function: typeFunction,
        isUser: true
      }
    ];
    const validating = checkValuesSender(check);
    if (typeof validating === 'object') {
      throw validating;
    }
    const result = await this.page.evaluate(
      ({ chatId, checkNumber }) => WAPI.startRecording(chatId, checkNumber),
      { chatId, checkNumber }
    );

    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Mark Paused
   * @param chatId Chat id
   * @param checkNumber the number when submitting!
   */
  public async markPaused(chatId: string, checkNumber: boolean) {
    const typeFunction = 'startRecording';
    const type = 'string';
    const check = [
      {
        param: 'chatId',
        type: type,
        value: chatId,
        function: typeFunction,
        isUser: true
      }
    ];
    const validating = checkValuesSender(check);
    if (typeof validating === 'object') {
      throw validating;
    }
    const result = await this.page.evaluate(
      ({ chatId, checkNumber }) => WAPI.markPaused(chatId, checkNumber),
      { chatId, checkNumber }
    );

    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Clear Presence
   * @param chatId Chat id
   */
  public async clearPresence(chatId: string) {
    const typeFunction = 'clearPresence';
    const type = 'string';
    const check = [
      {
        param: 'chatId',
        type: type,
        value: chatId,
        function: typeFunction,
        isUser: true
      }
    ];
    const validating = checkValuesSender(check);
    if (typeof validating === 'object') {
      throw validating;
    }

    const result = await this.page.evaluate(
      ({ chatId }) => WAPI.clearPresence(chatId),
      { chatId }
    );

    if (result['erro'] == true) {
      throw result;
    }
    return result;
  }

  /**
   * Presence Available
   */
  public async presenceAvailable() {
    return this.page.evaluate(() => WAPI.presenceAvailable());
  }

  /**
   * Presence Available
   */
  public async presenceUnavailable() {
    return this.page.evaluate(() => WAPI.presenceUnavailable());
  }

  /**
   * Sends text with tags
   *
   */
  public async sendMentioned(to: string, message: string, mentioned: string[]) {
    return await this.page.evaluate(
      ({ to, message, mentioned }) => {
        WAPI.sendMessageMentioned(to, message, mentioned);
      },
      { to, message, mentioned }
    );
  }

  /**
   * Sets the chat state
   * @param chatState
   * @param chatId
   */
  public async setChatState(chatId: string, chatState: ChatState) {
    return await this.page.evaluate(
      ({ chatState, chatId }) => {
        return WAPI.sendChatstate(chatState, chatId);
      },
      { chatState, chatId }
    );
  }

  public async sendReactions(IdMessage: string, emoji: string) {
    return await this.page.evaluate(
      ({ IdMessage, emoji }) => {
        WAPI.sendReactions(IdMessage, emoji);
      },
      { IdMessage, emoji }
    );
  }
}
