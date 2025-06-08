import os
import json
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton, InputFile, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder, CommandHandler, CallbackQueryHandler,
    MessageHandler, filters, ContextTypes, ConversationHandler
)

# Етапи діалогу для додавання
TITLE, DESCRIPTION, PRICE, PHOTOS = range(4)

# Тимчасове сховище
temp_product = {}
products_file = "products.json"
image_folder = "images"

TOKEN = "8049436425:AAHZ-SSBjhu5C8JfSvjhgyHT7i6UOVlx2F0"

os.makedirs(image_folder, exist_ok=True)

# ---------------------- КОМАНДИ ----------------------

async def send_main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[KeyboardButton("📦 Меню")]]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    if update.message:
        await update.message.reply_text("Натисніть кнопку нижче, щоб відкрити меню:", reply_markup=reply_markup)
    elif update.callback_query:
        await update.callback_query.message.reply_text("Натисніть кнопку нижче, щоб відкрити меню:", reply_markup=reply_markup)

async def handle_menu_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("➕ Додати нову", callback_data="add")],
        [InlineKeyboardButton("📋 Мої картки", callback_data="list")],
        [InlineKeyboardButton("🗑 Видалити", callback_data="delete")]
    ]
    await update.message.reply_text("📦 Меню:", reply_markup=InlineKeyboardMarkup(keyboard))

# ---------------------- ДОДАВАННЯ ----------------------

async def start_add(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    await query.message.reply_text("Введіть назву свічки:")
    return TITLE

async def get_title(update: Update, context: ContextTypes.DEFAULT_TYPE):
    temp_product["title"] = update.message.text
    await update.message.reply_text("Введіть опис:")
    return DESCRIPTION

async def get_description(update: Update, context: ContextTypes.DEFAULT_TYPE):
    temp_product["description"] = update.message.text
    await update.message.reply_text("Введіть ціну:")
    return PRICE

async def get_price(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        temp_product["price"] = int(update.message.text)
        temp_product["images"] = []
        await update.message.reply_text("Надішліть фото (по одному). Введіть /done коли завершите:")
        return PHOTOS
    except ValueError:
        await update.message.reply_text("Введіть числову ціну:")
        return PRICE

async def get_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo = update.message.photo[-1]
    file = await photo.get_file()
    filename = f"{temp_product['title'].replace(' ', '_')}_{len(temp_product['images']) + 1}.jpg"
    path = os.path.join(image_folder, filename)
    await file.download_to_drive(path)
    temp_product["images"].append(f"images/{filename}")
    await update.message.reply_text("Фото додано. Надішліть ще або /done")
    return PHOTOS

async def finish_product(update: Update, context: ContextTypes.DEFAULT_TYPE):
    products = []
    if os.path.exists(products_file):
        with open(products_file, "r", encoding="utf-8") as f:
            products = json.load(f)
    products.append(temp_product.copy())
    with open(products_file, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    await update.message.reply_text("✅ Свічку додано!")
    temp_product.clear()
    return ConversationHandler.END

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    temp_product.clear()
    await update.message.reply_text("❌ Скасовано")
    return ConversationHandler.END

# ---------------------- МОЇ КАРТКИ ----------------------

async def list_products(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    if os.path.exists(products_file):
        with open(products_file, "r", encoding="utf-8") as f:
            products = json.load(f)
        if products:
            text = "\n".join(f"• {p['title']}" for p in products)
            await query.message.reply_text(f"Ваші товари:\n{text}")
        else:
            await query.message.reply_text("Список порожній")
    else:
        await query.message.reply_text("Файл товарів не знайдено")

# ---------------------- ВИДАЛЕННЯ ----------------------

async def ask_delete(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    with open(products_file, "r", encoding="utf-8") as f:
        products = json.load(f)
    buttons = [[InlineKeyboardButton(p['title'], callback_data=f"del:{i}")] for i, p in enumerate(products)]
    await query.message.reply_text("Оберіть товар для видалення:", reply_markup=InlineKeyboardMarkup(buttons))

async def confirm_delete(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    index = int(query.data.split(":")[1])
    with open(products_file, "r", encoding="utf-8") as f:
        products = json.load(f)
    product = products[index]
    context.user_data['del_index'] = index
    keyboard = [[
        InlineKeyboardButton("✅ Видалити", callback_data="confirm_del"),
        InlineKeyboardButton("↩ Назад", callback_data="menu")
    ]]
    await query.message.reply_text(f"Видалити \"{product['title']}\"?", reply_markup=InlineKeyboardMarkup(keyboard))

async def delete_product(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    index = context.user_data.get("del_index")
    with open(products_file, "r", encoding="utf-8") as f:
        products = json.load(f)
    title = products[index]['title']
    del products[index]
    with open(products_file, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    await query.message.reply_text(f"✅ Товар \"{title}\" видалено")

# ---------------------- ГОЛОВНА ----------------------

if __name__ == '__main__':
    app = ApplicationBuilder().token(TOKEN).build()

    conv_handler = ConversationHandler(
        entry_points=[CallbackQueryHandler(start_add, pattern="^add$")],
        states={
            TITLE: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_title)],
            DESCRIPTION: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_description)],
            PRICE: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_price)],
            PHOTOS: [
                MessageHandler(filters.PHOTO, get_photo),
                CommandHandler("done", finish_product)
            ]
        },
        fallbacks=[CommandHandler("cancel", cancel)]
    )

    app.add_handler(CommandHandler("start", send_main_menu))
    app.add_handler(MessageHandler(filters.TEXT & filters.Regex("^📦 Меню$"), handle_menu_button))
    app.add_handler(conv_handler)
    app.add_handler(CallbackQueryHandler(list_products, pattern="^list$"))
    app.add_handler(CallbackQueryHandler(ask_delete, pattern="^delete$"))
    app.add_handler(CallbackQueryHandler(confirm_delete, pattern="^del:\d+$"))
    app.add_handler(CallbackQueryHandler(delete_product, pattern="^confirm_del$"))
    app.add_handler(CallbackQueryHandler(send_main_menu, pattern="^menu$"))

    print("✅ Бот запущений")
    app.run_polling()
