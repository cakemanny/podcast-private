from aiohttp import web
import aiohttp
import lxml.etree

async def index(request):
    raise web.HTTPFound('/index.html')

async def rss_fetch(request):
    if 'url' not in request.query:
        return web.Response(text="url param required", status=400)

    feed_url = request.query['url']
    if not feed_url or not feed_url.startswith('https://'):
        # Should probably have, way out for localhost...
        return web.Response(text="feed must use https", status=400)

    # TODO: timeouts, and size limits
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


def text_of(possible_element):
    if possible_element is not None:
        return possible_element.text
    return None


def convert_to_dict(rss_feed):
    channel = rss_feed.find('channel')

    data = {
        'title': channel.find('title').text,
        'link': channel.find('link').text,
        'description': channel.find('description').text,
        'pubDate': text_of(channel.find('pubDate')),
        'lastBuildDate': text_of(channel.find('lastBuildDate')),
    }

    image = channel.find('image')
    if len(image):
        data['image'] = {
            'url': text_of(image.find('url'))
        }

    items = []
    for item in channel.iterfind('item'):
        # technically all of these are optional, but we need some of them for
        # our app to work properly
        enclosure = item.find('enclosure')
        title = item.find('title')
        guid = item.find('guid')
        if title is None or enclosure is None or guid is None:
            continue
        items.append({
            'title': title.text,
            'link': text_of(item.find('link')),
            'description': text_of(item.find('description')),
            'enclosure': dict(enclosure.attrib),
            'guid': guid.text,
            'pubDate': text_of(item.find('pubDate')),
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
