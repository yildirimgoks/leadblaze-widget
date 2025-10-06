Three most common reasons for not approving a plugin are:

* The plugin contains unescaped output
* The plugin accepts unsanitized data
* The plugin processes form data without a nonce

If the code in your plugin falls into one of the above categories, **your plugin will not be approved**. The Plugins Team will refer you back to these Handbook pages, adding further delay to the review process.

# Security

The WordPress development team takes security seriously. With so much of the web relying on the integrity of the platform, security is critical. While the core developers have a dedicated team focused on securing the core platform, as a theme or plugin developer you are quite aware that there is potentially much that is outside the core which can be vulnerable. Because WordPress provides so much power and flexibility, plugins and themes are key points of weakness.

When writing code that will run across hundreds if not thousands of websites, you should be extra cautious of how you handle data coming into WordPress and how it's then presented to the end user. This commonly comes up when building a settings page for your theme, creating and manipulating shortcodes, or saving and rendering extra data associated with a post.

## Developing a Security Mindset

When developing, it is important to consider security as you add functionality. Use the following principles as you progress through your development efforts:

* **Don't trust any data.** Don't trust user input, third-party APIs, or data in your database without verification. Protection of your WordPress themes begins with ensuring the data entering and leaving your theme is as intended. Always make sure to **validate** and **sanitize** user input before using it, and to **escape** on output.
* **Rely on the WordPress API.** Many core WordPress functions provide the build in the functionality of validating and sanitizing data. Rely on the WordPress provided functions when possible.
* **Keep your code up to date.** As technology evolves, so does the potential for new security holes in your plugin or theme. Stay vigilant by maintaining your code and updating as required.

## Guiding principles

1. Never trust user input.
2. **Escape** as late as possible.
3. **Escape** everything from untrusted sources (e.g., databases and users), third-parties (e.g., Twitter), etc.
4. Never assume anything.
5. **Sanitation** is okay, but **validation**/**rejection** is better.

# Escaping Data

## In this article

Table of Contents

- Escaping Functions
- Custom Escaping Example
- Always escape late
- … Except when you can’t
- Escaping with Localization
- Examples  
  - Escaping any numeric variable used anywhere
  - Escaping arbitrary variable within HTML attribute
  - Escaping arbitrary URL within HTML attribute, but also in other contexts
  - Passing an arbitrary variable to JavaScript via wp_localize_script()
  - Escaping arbitrary variable within JavaScript block
    - Escaping arbitrary variable within inline JavaScript
    - Escaping arbitrary variable within HTML attribute for use by JavaScript
    - Escaping arbitrary string within HTML textarea
    - Escaping arbitrary string within HTML tags
    - Escaping arbitrary string within XML or XSL context

Escaping output is the process of securing output data by stripping out unwanted data, like malformed HTML or script tags. This process helps secure your data prior to rendering it for the end user.

## Escaping Functions

WordPress has many helper functions you can use for most common scenarios.

Pay close attention to what each function does, as some will remove HTML while others will permit it. You must use the most appropriate function to the content and context of what you’re echoing. You always want to escape when you echo, not before.

- `esc_html()` – Use anytime an HTML element encloses a section of data being displayed. This will remove HTML.

  ```php
  <h4><?php echo esc_html( $title ); ?></h4>
  ```

- `esc_js()` – Use for inline Javascript.

  ```php
  <div onclick='<?php echo esc_js( $value ); ?>' />
  ```

- `esc_url()` – Use on all URLs, including those in the src and href attributes of an HTML element.

  ```php
  <img alt="" src="<?php echo esc_url( $media_url ); ?>" />
  ```

- `esc_url_raw()` – Use when storing a URL in the database or in other cases where non-encoded URLs are needed.
- `esc_xml()` – Use to escape XML block.
- `esc_attr()` – Use on everything else that’s printed into an HTML element’s attribute.

  ```php
  <ul class="<?php echo esc_attr( $stored_class ); ?>">
  ```

- `esc_textarea()` – Use this to encode text for use inside a textarea element.
- `wp_kses()` – Use to safely escape for all non-trusted HTML (post text, comment text, etc.). This preserves HTML.
- `wp_kses_post()` – Alternative version of `wp_kses()` that automatically allows all HTML that is permitted in post content.
- `wp_kses_data()` – Alternative version of `wp_kses()` that allows only the HTML permitted in post comments.

## Custom Escaping Example

In the case that you need to escape your output in a specific way, the function `wp_kses()` (pronounced “kisses”) will come in handy.

This function makes sure that only the specified HTML elements, attributes, and attribute values will occur in your output, and normalizes HTML entities.

```php
<?php
echo wp_kses_post( $partial_html );
echo wp_kses(
    $another_partial_html,
    array(
        'a'      => array(
            'href'  => array(),
            'title' => array(),
        ),
        'br'     => array(),
        'em'     => array(),
        'strong' => array(),
    )
);
?>
```

In this example, all tags other than `<a>`, `<br>`, `<em>`, and `<strong>` will be stripped out. Additionally, if an `<a>` tag is passed, the escaping ensures that only the `href` and the `title` are returned.

## Always escape late

It is best to do the output escaping as late as possible, ideally as data is being outputted.

It is better to escape late for a few reasons:

- Code reviews and deploys can happen faster because it can be deemed safe for output at a glance, rather than hunting through many lines of code to see where and if it was already escaped.
- Something could inadvertently change the variable between when it was firstly cast and when it is outputted, introducing a potential vulnerability.
- Late escaping makes it easier to do automatic code scanning, saving time and cutting down on review and deploy times.
- Late escaping whenever possible makes the code more robust and future proof.
- Escaping/casting on output removes any ambiguity and adds clarity (always develop for the maintainer).

```php
// Okay, but not great.
$url = esc_url( $url );
$text = esc_html( $text );
echo '<a href="'. $url . '">' . $text . '</a>';

// Much better!
echo '<a href="'. esc_url( $url ) . '">' . esc_html( $text ) . '</a>';
```

## … Except when you can’t

It is sometimes not practical to escape late. In a few rare circumstances output cannot be passed to `wp_kses()`, since by definition it would strip the scripts that are being generated.

In situations like this, always escape while creating the string and store the value in a variable that is a postfixed with `_escaped`, `_safe` or `_clean` (e.g., `$variable` becomes `$variable_escaped` or `$variable_safe`).

If a function cannot output internally and escape late, then it must always return “safe” HTML. This allows `echo my_custom_script_code();` to be done without needing the script tag to be passed through a version of `wp_kses()` that would allow such tags.

## Escaping with Localization

Rather than using `echo` to output data, it’s common to use the WordPress localization functions, such as `_e()` or `__()`.

These functions simply wrap a localization function inside an escaping function:

```php
esc_html_e( 'Hello World', 'text_domain' );
// Same as
echo esc_html( __( 'Hello World', 'text_domain' ) );
```

These helper functions combine localization and escaping:

- `esc_html__()`
- `esc_html_e()`
- `esc_html_x()`
- `esc_attr__()`
- `esc_attr_e()`
- `esc_attr_x()`

## Examples

### Escaping any numeric variable used anywhere

```php
echo $int;
```

Depending on whether it is an integer or a float, `(int)`, `absint()`, `(float)` are all correct and acceptable.  
At times, `number_format()` or `number_format_i18n()` might be more appropriate.

`intval()`, `floatval()` are acceptable, but are outdated (PHP4) functions.

### Escaping arbitrary variable within HTML attribute

```php
echo '<div id="', $prefix, '-box', $id, '">';
```

This should be escaped with one call to `esc_attr()`.  
When a variable is used as part of an attribute or url, it is always better to escape the whole string as that way a potential escape character just before the variable will be correctly escaped.

**Correct:**

```php
echo '<div id="', esc_attr( $prefix . '-box' . $id ), '">';
```

**Incorrect:**

```php
echo '<div id="', esc_attr( $prefix ), '-box', esc_attr( $id ), '">';
```

Note: nonces created using `wp_create_nonce()` should also be escaped like this if used in an HTML attribute.

### Escaping arbitrary URL within HTML attribute, but also in other contexts

```php
echo '<a href="', $url, '">';
```

This should be escaped with `esc_url()`.

**Correct:**

```php
echo '<a href="', esc_url( $url ), '">';
```

**Incorrect:**

```php
echo '<a href="', esc_attr( $url ), '">';
echo '<a href="', esc_attr( esc_url( $url ) ), '">';
```

### Passing an arbitrary variable to JavaScript via wp_localize_script()

```php
wp_localize_script( 'handle', 'name',
    array(
        'prefix_nonce' => wp_create_nonce( 'plugin-name' ),
        'ajaxurl'      => admin_url( 'admin-ajax.php' ),
        'errorMsg'     => __( 'An error occurred', 'plugin-name' ),
    )
);
```

No escaping needed, WordPress will escape this.

### Escaping arbitrary variable within JavaScript block

```php
<script type="text/javascript">
    var myVar = <?php echo $my_var; ?>
</script>
```

`$my_var` should be escaped with `esc_js()`.

**Correct:**

```php
<script type="text/javascript">
    var myVar = <?php echo esc_js( $my_var ); ?>
</script>
```

### Escaping arbitrary variable within inline JavaScript

```php
<a href="#" onclick="do_something(<?php echo $var; ?>); return false;">
```

`$var` should be escaped with `esc_js()`.

**Correct:**

```php
<a href="#" onclick="do_something(<?php echo esc_js( $var ); ?>); return false;">
```

### Escaping arbitrary variable within HTML attribute for use by JavaScript

```php
<a href="#" data-json="<?php echo $var; ?>">
```

`$var` should be escaped with `esc_js()`, `json_encode()` or `wp_json_encode()`.

**Correct:**

```php
<a href="#" data-json="<?php echo esc_js( $var ); ?>">
```

### Escaping arbitrary string within HTML textarea

```php
echo '<textarea>', $data, '</textarea>';
```

`$data` should be escaped with `esc_textarea()`.

**Correct:**

```php
echo '<textarea>', esc_textarea( $data ), '</textarea>';
```

### Escaping arbitrary string within HTML tags

```php
echo '<div>', $phrase, '</div>';
```

This depends on whether `$phrase` is expected to contain HTML or not.

- If not, use `esc_html()` or any of its variants.
- If HTML is expected, use `wp_kses_post()`, `wp_kses_allowed_html()` or `wp_kses()` with a set of HTML tags you want to allow.

### Escaping arbitrary string within XML or XSL context

```php
echo '<loc>', $var, '</loc>';
```

Escape with `esc_xml()` or `ent2ncr()`.

**Correct:**

```php
echo '<loc>', ent2ncr( $var ), '</loc>';
```

First published

November 20, 2022

Last updated

May 22, 2025

# Sanitizing Data

## In this article

Table of Contents 

- Example
- Sanitization functions

Untrusted data comes from many sources (users, third party sites, even your own database!) and all of it needs to be checked before it’s used.

Remember: Even admins are users, and users will enter incorrect data, either on purpose or accidentally. It’s your job to protect them from themselves.

Sanitizing input is the process of securing/cleaning/filtering input data. Validation is preferred over sanitization because validation is more specific. But when “more specific” isn’t possible, sanitization is the next best thing.

## Example

Let’s say we have an input field named `title`:

```html
<input id="title" type="text" name="title">
```

We can’t use Validation here because the text field is too general: it can be anything at all. So we sanitize the input data with the `sanitize_text_field()` function:

```php
$title = sanitize_text_field( $_POST['title'] );
update_post_meta( $post->ID, 'title', $title );
```

Behind the scenes, `sanitize_text_field()` does the following:

1. Checks for invalid UTF-8  
2. Converts single less-than characters (<) to entity  
3. Strips all tags  
4. Removes line breaks, tabs and extra white space  
5. Strips octets

## Sanitization functions

There are many functions that will help you sanitize your data.

- `sanitize_email()`
- `sanitize_file_name()`
- `sanitize_hex_color()`
- `sanitize_hex_color_no_hash()`
- `sanitize_html_class()`
- `sanitize_key()`
- `sanitize_meta()`
- `sanitize_mime_type()`
- `sanitize_option()`
- `sanitize_sql_orderby()`
- `sanitize_term()`
- `sanitize_term_field()`
- `sanitize_text_field()`
- `sanitize_textarea_field()`
- `sanitize_title()`
- `sanitize_title_for_query()`
- `sanitize_title_with_dashes()`
- `sanitize_user()`
- `sanitize_url()`
- `wp_kses()`
- `wp_kses_post()`

# Nonces

## In this article

Table of Contents
- Why use a nonce?
- Creating a nonce 
  - Customize nonces for guests (non logged-in users)
  - Adding a nonce to a URL
  - Adding a nonce to a form
  - Creating a nonce for use in some other way
  - Verifying a nonce
  - Verifying a nonce passed in an AJAX request
- Modifying the nonce system
  - Modifying the nonce lifetime
  - Performing additional verification
  - Changing the error message
- Additional information 
  - Nonce lifetime
  - Nonce security
  - Replacing the nonce system
  - Related

A nonce is a “number used once” to help protect URLs and forms from certain types of misuse, malicious or otherwise.

Technically, WordPress nonces aren’t strictly numbers; they are a hash made up of numbers and letters. Nor are they used only once: they have a limited “lifetime” after which they expire. During that time period, the same nonce will be generated for a given user in a given context. The nonce for that action will remain the same for that user until that nonce life cycle has completed.

WordPress’s security tokens are called “nonces” (despite the above-noted differences from true nonces) because they serve much the same purpose as nonces do. They help protect against several types of attacks including CSRF, but do not protect against replay attacks because they aren’t checked for one-time use. Nonces should never be relied on for authentication, authorization, or access control. Protect your functions using `current_user_can()`, and always assume nonces can be compromised.

## Why use a nonce?

For an example of why a nonce is used, consider that an admin screen might generate a URL like this that trashes post number 123:

```
http://example.com/wp-admin/post.php?post=123&action=trash
```

When you go to that URL, WordPress will validate your authentication cookie information and, if you’re allowed to delete that post, will proceed to delete it. What an attacker can do with this is make your browser go to that URL without your knowledge. For example, the attacker could craft a disguised link on a 3rd party page like this:

```
<img src="http://example.com/wp-admin/post.php?post=123&action=trash" />
```

This would trigger your browser to make a request to WordPress, and the browser would automatically attach your authentication cookie and WordPress would consider this a valid request.

Adding a nonce would prevent this. For example, when using a nonce, the URLs that WordPress generate for the user look like this:

```
http://example.com/wp-admin/post.php?post=123&action=trash&_wpnonce=b192fc4204
```

If anyone attempts to trash post number 123 without having the correct nonce generated by WordPress and given to the user, WordPress will send a “403 Forbidden” response to the browser.

## Creating a nonce

You can create a nonce and add it to the query string in a URL, you can add it in a hidden field in a form, or you can use it some other way.

For nonces that are to be used in AJAX requests, it is common to add the nonce to a hidden field, from which JavaScript code can fetch it.

Note that the nonces are unique to the current user’s session, so if a user logs in or out asynchronously any nonces on the page will no longer be valid.

### Customize nonces for guests (non logged-in users)

WordPress core, by default, generates the same nonce for guests as they have the same user ID (value `0`). That is, it does not prevent guests from CSRF attacks. To enhance this security aspect for critical actions, you can develop a session mechanism for your guests, and hook to the `nonce_user_logged_out` filter for replacing the user ID value `0` with another random ID from the session mechanism.

### Adding a nonce to a URL

To add a nonce to a URL, call `wp_nonce_url()` specifying the bare URL and a string representing the action. For example:

```php
$complete_url = wp_nonce_url( $bare_url, 'trash-post_' . $post->ID );
```

For maximum protection, ensure that the string representing the action is as specific as possible.

By default, `wp_nonce_url()` adds a field named `_wpnonce`. You can specify a different name in the function call. For example:

```php
$complete_url = wp_nonce_url( $bare_url, 'trash-post_' . $post->ID, 'my_nonce' );
```

### Adding a nonce to a form

To add a nonce to a form, call `wp_nonce_field()` specifying a string representing the action. By default `wp_nonce_field()` generates two hidden fields, one whose value is the nonce and one whose value is the current URL (the referrer), and it echoes the result. For example, this call:

```php
wp_nonce_field( 'delete-comment_' . $comment_id );
```

might echo something like:

```html
<input type="hidden" id="_wpnonce" name="_wpnonce" value="796c7766b1" />
<input type="hidden" name="_wp_http_referer" value="/wp-admin/edit-comments.php" />
```

For maximum protection, ensure that the string representing the action is as specific as possible.

You can specify a different name for the nonce field, you can specify that you do not want a referrer field, and you can specify that you want the result to be returned and not echoed. For details of the syntax, see: `wp_nonce_field()`.

### Creating a nonce for use in some other way

To create a nonce for use in some other way, call `wp_create_nonce()` specifying a string representing the action. For example:

```php
$nonce = wp_create_nonce( 'my-action_' . $post->ID );
```

This simply returns the nonce itself. For example: `295a686963`

For maximum protection, ensure that the string representing the action is as specific as possible.

### Verifying a nonce

You can verify a nonce that was passed in a URL, a form in an admin screen, an AJAX request, or in some other context.

#### Verifying a nonce passed from an admin screen

To verify a nonce that was passed in a URL or a form in an admin screen, call `check_admin_referer()` specifying the string representing the action.

For example:

```php
check_admin_referer( 'delete-comment_' . $comment_id );
```

This call checks the nonce and the referrer, and if the check fails it takes the normal action (terminating script execution with a “403 Forbidden” response and an error message).

If you did not use the default field name (`_wpnonce`) when you created the nonce, specify the field name. For example:

```php
check_admin_referer( 'delete-comment_' . $comment_id, 'my_nonce' );
```

#### Verifying a nonce passed in an AJAX request

To verify a nonce that was passed in an AJAX request, call `check_ajax_referer()` specifying the string representing the action. For example:

```php
check_ajax_referer( 'process-comment' );
```

This call checks the nonce (but not the referrer), and if the check fails then by default it terminates script execution.

If you did not use one of the default field names (`_wpnonce` or `_ajax_nonce`) when you created the nonce, or if you want to take some other action instead of terminating execution, you can specify additional parameters. For details, see: `check_ajax_referer()`.

#### Verifying a nonce passed in some other context

To verify a nonce passed in some other context, call `wp_verify_nonce()` specifying the nonce and the string representing the action. For example:

```php
wp_verify_nonce( $_REQUEST['my_nonce'], 'process-comment' . $comment_id );
```

If the result is false, do not continue processing the request. Instead, take some appropriate action. The usual action is to call `wp_nonce_ays()`, which sends a “403 Forbidden” response to the browser.

## Modifying the nonce system

You can modify the nonce system by adding various actions and filters.

### Modifying the nonce lifetime

By default, a nonce has a lifetime of one day. After that, the nonce is no longer valid even if it matches the action string. To change the lifetime, add a `nonce_life` filter specifying the lifetime in seconds.

For example, to change the lifetime to four hours:

```php
add_filter( 'nonce_life', function () { return 4 * HOUR_IN_SECONDS; } );
```

### Performing additional verification

To perform additional verification when `check_admin_referer()` has found that the nonce and the referrer are valid, add a `check_admin_referer` action.

For example:

```php
function wporg_additional_check ( $action, $result ) {
    ...
}
add_action( 'check_admin_referer', 'wporg_additional_check', 10, 2 );
```

For `check_ajax_referer()` add a `check_ajax_referer` action in the same way.

### Changing the error message

You can change the error message sent when a nonce is not valid, by using the translation system. For example:

```php
function my_nonce_message ( $translation ) {
    if ( $translation === 'Are you sure you want to do this?' ) {
        return 'No! No! No!';
    }
    return $translation;
}
add_filter( 'gettext', 'my_nonce_message' );
```

## Additional information

### Nonce lifetime

Note that just as a WordPress nonce is not “a number used once”, nonce lifetime isn’t really nonce lifetime. WordPress uses a system with two ticks (half of the lifetime) and validates nonces from the current tick and the last tick. In default settings (24-hour lifetime) this means that the time information in the nonce is related to how many 12-hour periods of time have passed since the Unix epoch. This means that a nonce made between midday and midnight will have a lifetime until midday the next day.

The actual lifetime is thus variable between 12 and 24 hours.

When a nonce is valid, the functions that validate nonces return the current tick number, 1 or 2. You could use this information, for example, to refresh nonces that are in their second tick so that they do not expire.

### Nonce security

Nonces are generated using a key and salt that are unique to your site if you have installed WordPress correctly. `NONCE_KEY` and `NONCE_SALT` are defined in your `wp-config.php` file, and the file contains comments that provide more information.

Nonces should never be relied on for authentication or authorization, or for access control. Protect your functions using `current_user_can()`, always assume nonces can be compromised.

### Replacing the nonce system

Some of the functions that make up the nonce system are pluggable so that you can replace them by supplying your own functions.

To change the way admin requests or AJAX requests are verified, you can replace `check_admin_referer()` or `check_ajax_referer()`, or both.

To replace the nonce system with some other nonce system, you can replace `wp_create_nonce()`, `wp_verify_nonce()`, and `wp_nonce_tick()`.

### Related

Nonce functions: `wp_nonce_ays()`, `wp_nonce_field()`, `wp_nonce_url()`, `wp_verify_nonce()`, `wp_create_nonce()`, `check_admin_referer()`, `check_ajax_referer()`, `wp_referer_field()`

Nonce hooks: `nonce_life`, `nonce_user_logged_out`, `explain_nonce_(verb)-(noun)`, `check_admin_referer`

