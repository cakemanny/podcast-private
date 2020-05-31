from aiohttp import web
import aiohttp
import lxml.etree

async def index(request):
    raise web.HTTPFound('/index.html')

async def rss_fetch(request):
    if 'url' not in request.query:
        return web.Response(text="url param required", status=400)

    feed_url = request.query['url']
    async with aiohttp.ClientSession() as session:
        async with session.get(feed_url) as resp:
            if resp.status != 200:
                return web.Response(
                    text=await resp.text(),
                    status=resp.status,
                )
            response_bytes = await resp.read()
            tree = lxml.etree.fromstring(response_bytes)
            data = convert_to_dict(tree)
            return web.json_response(data)


def convert_to_dict(rss_feed):
    channel = rss_feed.find('channel')

    data = {
        'title': channel.find('title').text,
        'description': channel.find('description').text,
        'link': channel.find('link').text,
        'pubDate': channel.find('pubDate').text,
        'lastBuildDate': channel.find('lastBuildDate').text,
    }

    image = channel.find('image')
    if len(image):
        data['image'] = {
            'url': image.find('url').text
        }

    items = []
    for item in channel.iterfind('item'):
        enclosure = item.find('enclosure')
        items.append({
            'title': item.find('title').text,
            'link': item.find('link').text,
            'description': item.find('description').text,
            'enclosure': dict(enclosure.attrib) if enclosure is not None else None,
            'guid': item.find('guid').text,
            'pubDate': item.find('pubDate').text,
        })
    data['items'] = items
    return data


app = web.Application()
app.add_routes([
    web.get('/api/fetch_feed', rss_fetch),
    web.get('/', index),
    web.static('/', './static', append_version=True)
])

if __name__ == '__main__':
    web.run_app(app)
